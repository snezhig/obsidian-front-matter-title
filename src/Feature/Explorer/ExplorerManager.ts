import { TFile, TFileExplorerItem, TFileExplorerView } from "obsidian";
import { Leaves, Feature } from "@src/Enum";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import AbstractManager from "@src/Feature/AbstractManager";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";
import { ExplorerFileItemMutator } from "./ExplorerFileItemMutator";
import { ResolverInterface } from "../../Resolver/Interfaces";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";

@injectable()
export default class ExplorerManager extends AbstractManager {
    private explorerView: TFileExplorerView = null;
    private modified = new WeakMap<TFileExplorerItem, ExplorerFileItemMutator>();
    private enabled = false;
    private sort: ExplorerSort = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["feature:explorer:file_mutator:factory"])
        private factory: (item: TFileExplorerItem, resolver: ResolverInterface) => ExplorerFileItemMutator,
        @inject(SI['feature:explorer:sort'])
        sort: ExplorerSort
    ) {
        super();
        this.sort = sort.isEnabled() ? sort : null;
    }

    getId(): Feature {
        return Feature.Explorer;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    protected doDisable() {
        if (this.explorerView) {
            this.restoreTitles();
            this.explorerView = null;
        }
        this.enabled = false;
    }

    protected doEnable() {
        this.explorerView = this.getExplorerView();
        this.enabled = true;
    }

    private getExplorerView(): TFileExplorerView | null {
        const views = this.facade.getViewsOfType(Leaves.FE);

        if (views.length > 1) {
            throw new Error("There are some explorers' leaves");
        }

        const view = views?.[0];

        //TODO: what if it be later?
        if (view === undefined || view === null) {
            throw new ExplorerViewUndefined("Explorer view is undefined");
        }

        return view as TFileExplorerView;
    }

    private async updateInternal(items: TFileExplorerItem[]): Promise<{ [k: string]: boolean }> {
        for (const i of items) {
            if (!(i.file instanceof TFile)) {
                continue;
            }
            if (!this.modified.has(i)) {
                this.modified.set(i, this.factory(i, this.resolver));
            }
            i.updateTitle();
        }
        return {};
    }

    private restoreTitles(): void {
        Object.values(this.explorerView.fileItems).map(this.restore.bind(this));
    }

    private restore(item: TFileExplorerItem): boolean {
        if (this.modified.has(item)) {
            this.modified.get(item).destroy();
            item.updateTitle();
            this.modified.delete(item);
            return true;
        }
        return false;
    }

    protected doRefresh(): Promise<{ [p: string]: boolean }> {
        return this.updateInternal(Object.values(this.explorerView.fileItems));
    }

    protected async doUpdate(path: string): Promise<boolean> {
        const item = this.explorerView.fileItems[path];
        await this.updateInternal(item ? [item] : []);
        return !!item;
    }

    static getId(): Feature {
        return Feature.Explorer;
    }
}
