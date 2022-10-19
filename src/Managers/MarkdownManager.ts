import AbstractManager from "@src/Managers/AbstractManager";
import { Manager } from "@src/enum";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { inject, named } from "inversify";
import SI from "@config/inversify.types";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { View, WorkspaceLeafExt } from "obsidian";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";

export class MarkdownManager extends AbstractManager {
    private enabled = false;
    private replacer: FunctionReplacer<View, "getDisplayText", MarkdownManager> = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface
    ) {
        super();
    }

    protected doDisable(): Promise<void> {
        return Promise.resolve(undefined);
    }

    private initReplacer(): void {
        if (this.replacer !== null) {
            return;
        }
        const view = app.workspace.getLeaf().view;
        this.replacer = FunctionReplacer.create(
            Object.getPrototypeOf(view),
            "getDisplayText",
            this,
            function (self, defaultArgs, vanilla) {
                let title = !this.file || this.getViewType() !== "markdown" ? vanilla.call(this, defaultArgs) : null;
                title = title ?? self.resolver.resolve(this.file.path) ?? vanilla.call(this, defaultArgs);
                return title;
            }
        );
    }

    private updateHeader(): void {
        this.facade.getLeavesOfType<WorkspaceLeafExt>("markdown").forEach(e => e.updateHeader());
    }

    protected doEnable(): Promise<void> {
        this.initReplacer();
        this.replacer?.enable();
        this.updateHeader();
        return Promise.resolve(undefined);
    }

    protected doUpdate(path?: string | null): Promise<boolean> {
        return Promise.resolve(false);
    }

    getId(): Manager {
        return Manager.Markdown;
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
