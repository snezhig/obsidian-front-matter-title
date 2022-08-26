import {TAbstractFile, TFileExplorerItem, TFileExplorerView, Workspace} from "obsidian";
import Resolver from "src/Title/Resolver/Resolver";
import Manager from "./Manager";
import {Leaves} from "../../enum";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";

export default class ExplorerManager implements Manager {
    private explorerView: TFileExplorerView = null;
    private originTitles = new Map<string, string>();
    private enabled = false;

    constructor(
        private workspace: Workspace,
        private resolver: ResolverInterface<Resolving.Async>
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
        const leaves = this.workspace.getLeavesOfType(Leaves.FE);

        if (leaves.length > 1) {
            //TODO: error? Try to work with more than one explorer?
            console.log('there is more then one explorer')
            return null;
        }

        //TODO: what if it be later?
        if (leaves?.first()?.view === undefined) {
            console.log('explorer is undefined');
            return null;
        }

        return leaves.first().view as TFileExplorerView;
    }

    async update(fileOrPath: TAbstractFile | null = null): Promise<boolean> {
        if (!this.isEnabled() || !this.explorerView) {
            return false;
        }

        const items = fileOrPath
            ? [this.explorerView.fileItems[fileOrPath.path]]
            : Object.values(this.explorerView.fileItems);

        const promises = items.map(e => this.setTitle(e));

        return Promise.all(promises).then(() => true);
    }

    private async setTitle(item: TFileExplorerItem): Promise<void> {
        const title = await this.resolver.resolve(item.file.path).catch((e) => {
            console.error(e);
            return e;
        });

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
