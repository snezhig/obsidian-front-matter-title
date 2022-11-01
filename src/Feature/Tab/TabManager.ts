import AbstractManager from "@src/Feature/AbstractManager";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import { Manager } from "@src/enum";
import { MarkdownLeaf } from "obsidian";

@injectable()
export default class TabManager extends AbstractManager {
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

    protected async doRefresh(): Promise<{ [k: string]: boolean }> {
        return this.innerUpdate();
    }

    protected async doUpdate(path: string): Promise<boolean> {
        const result = await this.innerUpdate(path);
        return result[path] === true;
    }

    getId(): Manager {
        return Manager.Tab;
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
