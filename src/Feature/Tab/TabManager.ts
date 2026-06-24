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
    private replacerDisplayText: FunctionReplacer<WorkspaceLeaf, "getDisplayText", TabManager> = null;

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
        this.replacerDisplayText?.disable();
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
        if (!leaf) {
            return;
        }
        const proto = Object.getPrototypeOf(leaf);
        this.replacer = FunctionReplacer.tryCreate(proto, "setPinned", this, function (self, [pinned], vanilla) {
            const result = vanilla.call(this, pinned);
            // Guard this.view.file — it can be undefined for some leaves (e.g. after
            // switching a workspace with locked tabs), which used to crash (#251).
            if (this?.view?.getViewType() === Leaves.MD && this.view?.file) {
                self.innerUpdate(this.view.file.path);
            }
            return result;
        });
        this.replacer?.enable();

        // Also patch the leaf's own display text so Obsidian renders the resolved
        // title itself — otherwise the tab title is recomputed and lost on some tab
        // switches (#248/#277).
        this.replacerDisplayText = FunctionReplacer.tryCreate(
            proto,
            "getDisplayText",
            this,
            function (self, _args, vanilla) {
                const filePath = this?.view?.file?.path ?? (this?.view?.getState?.() ?? {}).file ?? null;
                return filePath ? self.resolver.resolve(filePath) ?? vanilla.call(this) : vanilla.call(this);
            }
        );
        this.replacerDisplayText?.enable();
    }

    private reset() {
        const leaves = this.facade.getLeavesOfType<MarkdownLeaf>("markdown");
        for (const leaf of leaves) {
            const file = leaf.view?.file;
            if (file && leaf.tabHeaderInnerTitleEl) {
                leaf.tabHeaderInnerTitleEl.setText(file.basename);
            }
        }
    }

    private async innerUpdate(path: string = null): Promise<{ [k: string]: boolean }> {
        const leaves = this.facade.getLeavesOfType<MarkdownLeaf>("markdown");
        const result: { [k: string]: boolean } = {};
        for (const leaf of leaves) {
            const filePath = leaf.view?.getState()?.file as string;
            if (!filePath || (path && path !== filePath)) {
                continue;
            }
            result[filePath] = false;
            if (!leaf.tabHeaderInnerTitleEl) {
                continue;
            }
            const title = filePath ? this.resolver.resolve(filePath) : null;
            if (title && title !== leaf.tabHeaderInnerTitleEl.getText()) {
                leaf.tabHeaderInnerTitleEl.setText(title);
                result[filePath] = true;
            }
        }
        return result;
    }
}
