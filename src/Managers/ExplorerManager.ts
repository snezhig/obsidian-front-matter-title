import {TAbstractFile, TFileExplorerItem, TFileExplorerView, Workspace} from "obsidian";
import Resolver from "@src/Title/Resolver/Resolver";
import {Leaves} from "@src/enum";
import {inject, injectable, named} from "inversify";
import SI from "@config/inversify.types";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import {getLeavesOfType} from "@src/Obsidian/Types";
import ExplorerViewUndefined from "@src/Managers/Exceptions/ExplorerViewUndefined";

@injectable()
export default class ExplorerManager{
    private explorerView: TFileExplorerView = null;
    private originTitles = new Map<string, string>();
    private enabled = false;

    constructor(
        @inject(SI.resolver) @named(Resolving.Async)
        private resolver: ResolverInterface<Resolving.Async>,
        @inject(SI["getter:obsidian:leaves"])
        private leavesGetter: getLeavesOfType

    ) {
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    disable(): void {
        if(this.explorerView) {
            this.restoreTitles();
            this.explorerView = null;
        }
        this.enabled = false;
    }

    enable(): void {
        this.explorerView = this.getExplorerView();
        this.enabled = true;
    }


    private getExplorerView(): TFileExplorerView | null {
        const leaves = this.leavesGetter(Leaves.FE);

        if (leaves.length > 1) {
            throw new Error("There are some explorers' leaves");
        }

        const view = leaves?.[0]?.view;
        //TODO: what if it be later?
        if (view === undefined) {
            throw new ExplorerViewUndefined('Explorer view is undefined');
        }

        return view as TFileExplorerView;
    }

    async update(path: string | null = null): Promise<boolean> {
        if (!this.isEnabled()) {
            return false;
        }

        const items = path
            ? [this.explorerView.fileItems[path]]
            : Object.values(this.explorerView.fileItems);

        if(!items.filter(e => e).length){
            return  false;
        }

        const promises = items.map(e => this.setTitle(e));

        return Promise.all(promises).then(() => true);
    }

    private async setTitle(item: TFileExplorerItem): Promise<void> {
        const title = await this.resolver.resolve(item.file.path).catch(() => null);

        if (this.isTitleEmpty(title)) {
            return this.restore(item);
        } else if (item.titleInnerEl.innerText !== title) {
            this.keepOrigin(item);
            item.titleInnerEl.innerText = title;
        }
    }

    private isTitleEmpty = (title: string): boolean => title === null || title === '';

    private keepOrigin(item: TFileExplorerItem): void {
        if (!this.originTitles.has(item.file.path)) {
            this.originTitles.set(item.file.path, item.titleInnerEl.innerText);
        }
    }

    private restoreTitles(): void {
        Object.values(this.explorerView.fileItems).map(this.restore.bind(this));
    }

    private restore(item: TFileExplorerItem): void {
        if (this.originTitles.has(item.file.path)) {
            item.titleInnerEl.innerText = this.originTitles.get(item.file.path);
            this.originTitles.delete(item.file.path);
        }
    }
}