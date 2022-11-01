import FunctionReplacer from "../../Utils/FunctionReplacer";
import CallbackInterface from "../../Components/EventDispatcher/Interfaces/CallbackInterface";
import { AppEvents } from "@src/Types";
import { inject, injectable, named } from "inversify";
import SI from "../../../config/inversify.types";
import ResolverInterface, { Resolving } from "../../Interfaces/ResolverInterface";
import LoggerInterface from "../../Components/Debug/LoggerInterface";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import DispatcherInterface from "../../Components/EventDispatcher/Interfaces/DispatcherInterface";
import { debounce, TFileExplorerItem, TFileExplorerView, TFolder } from "obsidian";
import CallbackVoid from "../../Components/EventDispatcher/CallbackVoid";
import { Feature, Leaves, Manager } from "@src/enum";
import AbstractFeature from "../AbstractFeature";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";

@injectable()
export default class ExplorerSort extends AbstractFeature<Feature> {
    private view: TFileExplorerView;
    private enabled = false;
    private replacer: FunctionReplacer<TFileExplorerItem, "sort", ExplorerSort>;
    private readonly cb: CallbackInterface<AppEvents["manager:update"]>;

    constructor(
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface<Resolving.Sync>,
        @inject(SI.logger)
        @named("explorer:feature:sort")
        private logger: LoggerInterface,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>
    ) {
        super();
        const trigger = debounce(this.onManagerUpdate.bind(this), 1000);
        this.cb = new CallbackVoid(e => {
            if (e.get().id === Manager.Explorer && e.get().result) {
                trigger();
            }
        });
    }

    private onManagerUpdate(): void {
        this.logger.log("Try to request sort by event");
        if (!this.isEnabled()) {
            this.logger.log("Skipped because feature is not enabled");
            return;
        }
        this.view.requestSort();
    }

    static getId(): Feature {
        return Feature.ExplorerSort;
    }

    private initView(): void {
        this.view = (this.facade.getLeavesOfType(Leaves.FE)?.[0]?.view as TFileExplorerView) ?? null;
    }

    private tryToReplaceOriginalSort(): void {
        if (!this.isEnabled()) {
            return;
        }
        if (this.replacer) {
            this.logger.log(`Replacer is exist already. State is ${this.replacer.isEnabled()}`);
            if (!this.replacer.isEnabled()) {
                this.logger.log("Enable replacer");
                this.replacer.enable();
            }
            return;
        }
        const item = this.getFolderItem();
        if (!item) {
            this.logger.log("Folder item not found. Try again in 1000 ms");
            setTimeout(() => this.tryToReplaceOriginalSort(), 1000);
            return;
        }
        this.logger.log("Init replacer");

        this.replacer = new FunctionReplacer<TFileExplorerItem, "sort", ExplorerSort>(
            //@ts-ignore
            item.__proto__,
            "sort",
            this,
            function (args, defaultArgs, vanilla) {
                args.sort(this, vanilla);
            }
        );
        this.replacer.enable();
    }

    private isSortSupported(sort: string): boolean {
        return ["alphabeticalReverse", "alphabetical"].includes(sort);
    }

    private isAsc(order: string): boolean {
        return order === "alphabetical";
    }

    private sort(item: TFileExplorerItem, vanilla: () => void) {
        const sortOrder = this.view.sortOrder;

        if (!this.isSortSupported(sortOrder)) {
            this.logger.log(`Sort is ${sortOrder}. Skipped.`);
            vanilla.call(item);
            return;
        }
        if (!(item.file instanceof TFolder)) {
            this.logger.log("File is not TFolder. Why? Skipped.");
            vanilla.call(item);
            return;
        }
        this.logger.log("Sort by feature");
        const children = item.file.children.slice();
        const result = [];
        children.sort((a, b) => {
            const i = a instanceof TFolder;
            const r = b instanceof TFolder;
            let k;
            if (i && !r) {
                k = -1;
            } else if (!i && r) {
                k = 1;
            } else {
                const at = i ? a.name : this.resolver.resolve(a.path) ?? a.name;
                const bt = r ? b.name : this.resolver.resolve(b.path) ?? b.name;
                k = at.localeCompare(bt);
                k = this.isAsc(sortOrder) ? k : -k;
            }
            return k;
        });

        for (const child of children) {
            const f = this.view.fileItems[child.path];
            f && result.push(f);
        }

        item.vChildren.setChildren(result);
    }

    private getFolderItem(): TFileExplorerItem {
        for (const item of Object.values(this.view.fileItems)) {
            if (item.file instanceof TFolder) {
                return item;
            }
        }
    }

    public async enable(): Promise<void> {
        if (this.isEnabled()) {
            return;
        }
        if (!this.view && (this.initView(), !this.view)) {
            throw new ExplorerViewUndefined();
        }
        this.dispatcher.addListener("manager:update", this.cb);
        this.enabled = true;
        this.tryToReplaceOriginalSort();
        this.logger.log("enabled");
    }

    public async disable(): Promise<void> {
        this.enabled = false;
        this.dispatcher.removeListener("manager:update", this.cb);
        this.replacer?.disable();
        this.view?.requestSort();
        this.logger.log("disabled");
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    getId(): Feature {
        return Feature.ExplorerSort;
    }
}
