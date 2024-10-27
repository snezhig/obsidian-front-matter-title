import FunctionReplacer from "../../Utils/FunctionReplacer";
import { AppEvents } from "@src/Types";
import { inject, injectable, named } from "inversify";
import SI from "../../../config/inversify.types";
import LoggerInterface from "../../Components/Debug/LoggerInterface";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { debounce, TFileExplorerItem, TFileExplorerView, TFolder } from "obsidian";
import { Feature, Leaves } from "@src/Enum";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import FeatureService from "../FeatureService";
import { FunctionReplacerFactory } from "@config/inversify.factory.types";

@injectable()
export default class ExplorerSort {
    private view: TFileExplorerView;
    private started = false;
    private replacer: FunctionReplacer<TFileExplorerView, "getSortedFolderItems", ExplorerSort>;
    private readonly cb: (e: { id: string; result?: boolean }) => void;
    private refs: [ListenerRef<"manager:refresh">?, ListenerRef<"manager:update">?] = [];
    private resolver: ResolverInterface;

    constructor(
        @inject(SI.logger)
        @named("explorer:feature:sort")
        private logger: LoggerInterface,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["feature:service"])
        service: FeatureService,
        @inject(SI["factory:replacer"])
        private readonly replacerFactory: FunctionReplacerFactory<
            TFileExplorerView,
            "getSortedFolderItems",
            ExplorerSort
        >
    ) {
        this.resolver = service.createResolver(Feature.Explorer);
        const trigger = debounce(this.onManagerUpdate.bind(this), 1000);
        this.cb = e => {
            if (e.id === Feature.Explorer && (e.result === true || e.result === undefined)) {
                trigger();
            }
        };
    }

    public start(): void {
        if (this.isStarted()) {
            return;
        }
        if (!this.view && (this.initView(), !this.view)) {
            throw new ExplorerViewUndefined();
        }

        this.refs.push(this.dispatcher.addListener({ name: "manager:refresh", cb: e => this.cb({ id: e.get().id }) }));
        this.refs.push(
            this.dispatcher.addListener({
                name: "manager:update",
                cb: e => this.cb(e.get()),
            })
        );
        this.started = true;
        this.tryToReplaceOriginalSort();
        this.logger.log("enabled");
    }

    public stop(): void {
        this.started = false;
        this.refs.forEach(e => this.dispatcher.removeListener(e));
        this.refs = [];
        this.replacer?.disable();
        this.view?.requestSort();
        this.logger.log("disabled");
    }

    public isStarted(): boolean {
        return this.started;
    }

    private onManagerUpdate(): void {
        this.logger.log("Try to request sort by event");
        if (!this.isStarted()) {
            this.logger.log("Skipped because feature is not enabled");
            return;
        }
        this.view.requestSort();
    }

    private initView(): void {
        this.view = this.facade.getViewsOfType<TFileExplorerView>(Leaves.FE)?.[0] ?? null;
    }

    private tryToReplaceOriginalSort(): void {
        if (!this.isStarted()) {
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

        this.logger.log("Init replacer");

        this.replacer = this.replacerFactory(
            Object.getPrototypeOf(this.view),
            "getSortedFolderItems",
            this,
            (feature, defaultArgs, vanilla) => {
                return feature.getSortedFolderItems(defaultArgs?.[0]) ?? vanilla.call(this);
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

    private getSortedFolderItems(folder: TFolder): TFileExplorerItem[] | null {
        const sortOrder = this.view.sortOrder;

        if (!this.isSortSupported(sortOrder)) {
            this.logger.log(`Sort is ${sortOrder}. Skipped.`);
            return;
        }
        if (!(folder instanceof TFolder)) {
            this.logger.log("File is not TFolder. Why? Skipped.");
            return;
        }

        const children = folder.children.slice();
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
        return result;
    }
}
