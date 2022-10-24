import AbstractManager from "@src/Managers/AbstractManager";
import { Manager } from "@src/enum";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { inject, named } from "inversify";
import SI from "@config/inversify.types";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { MarkdownLeaf, TFile, View } from "obsidian";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";

export class TabManager extends AbstractManager {
    private enabled = false;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface
    ) {
        super();
    }

    protected async doDisable(): Promise<void> {
        this.enabled = false;
    }

    protected async doEnable(): Promise<void> {
        this.enabled = true;
        return;
    }

    protected async doUpdate(): Promise<boolean> {
        const leaves = this.facade.getLeavesOfType<MarkdownLeaf>("markdown");
        for (const leaf of leaves) {
            const file = leaf.view?.file;
            const title = file ? this.resolver.resolve(file.path) : null;
            if (title && title !== leaf.tabHeaderInnerTitleEl.getText()) {
                leaf.tabHeaderInnerTitleEl.setText(title);
            }
        }
        return this.isEnabled();
    }

    getId(): Manager {
        return Manager.Tab;
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
