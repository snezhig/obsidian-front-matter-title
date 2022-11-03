import { TFileExplorerItem, TFileExplorerView } from "obsidian";
import { Leaves, Feature } from "@src/enum";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import AbstractManager from "@src/Feature/AbstractManager";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";

@injectable()
export default class ExplorerManager extends AbstractManager {
    private explorerView: TFileExplorerView = null;
    private originTitles = new Map<string, string>();
    private enabled = false;

    constructor(
        @inject(SI.resolver)
        @named(Resolving.Async)
        private resolver: ResolverInterface<Resolving.Async>,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade
    ) {
        super();
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
        const leaves = this.facade.getLeavesOfType(Leaves.FE);

        if (leaves.length > 1) {
            throw new Error("There are some explorers' leaves");
        }

        const view = leaves?.[0]?.view;
        //TODO: what if it be later?
        if (view === undefined) {
            throw new ExplorerViewUndefined("Explorer view is undefined");
        }

        return view as TFileExplorerView;
    }

    private async updateInternal(items: TFileExplorerItem[]): Promise<{ [k: string]: boolean }> {
        if (!items.filter(e => e).length) {
            return {};
        }

        const result: { [k: string]: boolean } = {};
        const promises = items.map(e => this.setTitle(e).then(r => (result[e.file.path] = r)));

        await Promise.all(promises);
        return result;
    }

    private async setTitle(item: TFileExplorerItem): Promise<boolean> {
        const title = await this.resolver.resolve(item.file.path).catch(() => null);
        if (this.isTitleEmpty(title)) {
            return this.restore(item);
        } else if (item.titleInnerEl.innerText !== title) {
            this.keepOrigin(item);
            item.titleInnerEl.innerText = title;
            return true;
        }
        return false;
    }

    private isTitleEmpty = (title: string): boolean => title === null || title === "" || title === undefined;

    private keepOrigin(item: TFileExplorerItem): void {
        if (!this.originTitles.has(item.file.path)) {
            this.originTitles.set(item.file.path, item.titleInnerEl.innerText);
        }
    }

    private restoreTitles(): void {
        Object.values(this.explorerView.fileItems).map(this.restore.bind(this));
    }

    private restore(item: TFileExplorerItem): boolean {
        if (this.originTitles.has(item.file.path)) {
            item.titleInnerEl.innerText = this.originTitles.get(item.file.path);
            this.originTitles.delete(item.file.path);
            return true;
        }
        return false;
    }

    protected doRefresh(): Promise<{ [p: string]: boolean }> {
        return this.updateInternal(Object.values(this.explorerView.fileItems));
    }

    protected async doUpdate(path: string): Promise<boolean> {
        const item = this.explorerView.fileItems[path];
        const result = await this.updateInternal(item ? [item] : []);
        return result[path] === true;
    }

    static getId(): Feature {
        return Feature.Explorer;
    }
}
