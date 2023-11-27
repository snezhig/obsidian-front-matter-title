import AbstractManager from "@src/Feature/AbstractManager";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { Feature, Leaves } from "@src/Enum";
import { MarkdownLeaf, WorkspaceLeaf } from "obsidian";
import { AppEvents } from "@src/Types";
import { ObsidianActiveFile } from "@config/inversify.factory.types";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import FunctionReplacer from "../../Utils/FunctionReplacer";

@injectable()
export default class TabManager extends AbstractManager {
    private enabled = false;
    private readonly callback: () => void = null;
    private ref: ListenerRef<"layout:change">;
    private replacer: FunctionReplacer<WorkspaceLeaf, "setPinned", TabManager> = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["factory:obsidian:active:file"])
        factory: ObsidianActiveFile
    ) {
        super();
        this.callback = () => {
            const file = factory();
            file && this.update(file.path);
        };
    }

    static getId(): Feature {
        return Feature.Tab;
    }

    getId(): Feature {
        return TabManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    protected async doDisable(): Promise<void> {
        this.dispatcher.removeListener(this.ref);
        this.replacer?.disable();
        this.ref = null;
        this.reset();
        this.enabled = false;
    }

    protected async doEnable(): Promise<void> {
        this.enabled = true;
        this.initReplacer();
        this.ref = this.dispatcher.addListener({ name: "layout:change", cb: this.callback });
        return;
    }

    protected async doRefresh(): Promise<{ [k: string]: boolean }> {
        return this.innerUpdate();
    }

    protected async doUpdate(path: string): Promise<boolean> {
        const result = await this.innerUpdate(path);
        return result[path] === true;
    }

    private initReplacer(): void {
        const leaf = this.facade.getActiveLeaf();
        this.replacer = FunctionReplacer.create(
            Object.getPrototypeOf(leaf),
            "setPinned",
            this,
            function (self, [pinned], vanilla) {
                const result = vanilla.call(this, pinned);
                if (this?.view?.getViewType() === Leaves.MD) {
                    self.innerUpdate(this.view.file.path);
                }
                return result;
            }
        );
        this.replacer.enable();
    }

    private reset() {
        const leaves = this.facade.getLeavesOfType<MarkdownLeaf>("markdown");
        for (const leaf of leaves) {
            const file = leaf.view?.file;
            if (file) {
                leaf.tabHeaderInnerTitleEl.setText(file.basename);
            }
        }
    }

    private async innerUpdate(path: string = null): Promise<{ [k: string]: boolean }> {
        const leaves = this.facade.getLeavesOfType<MarkdownLeaf>("markdown");
        const result: { [k: string]: boolean } = {};
        for (const leaf of leaves) {
            const file = leaf.view?.file;
            if (path && path !== file.path) {
                continue;
            }
            result[file.path] = false;
            const title = file ? this.resolver.resolve(file.path) : null;
            if (title && title !== leaf.tabHeaderInnerTitleEl.getText()) {
                leaf.tabHeaderInnerTitleEl.setText(title);
                result[file.path] = true;
            }
        }
        return result;
    }
}
