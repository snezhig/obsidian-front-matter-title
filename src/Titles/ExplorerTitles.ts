import {TAbstractFile, TFileExplorerItem, TFileExplorerView} from "obsidian";
import TitleResolver from "src/Title/Resolver/TitleResolver";
import TitlesManager from "./TitlesManager";

export default class ExplorerTitles implements TitlesManager {
    private originTitles = new Map<string, string>();
    private enabled = false;

    constructor(
        private explorerView: TFileExplorerView,
        private resolver: TitleResolver
    ) {
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    disable(): void {
        this.restoreTitles();
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
    }

    async update(abstract: TAbstractFile | null = null): Promise<boolean> {
        if (!this.isEnabled()) {
            return false;
        }

        const items = abstract
            ? [this.explorerView.fileItems[abstract.path]]
            : Object.values(this.explorerView.fileItems);

        const promises = items.map(e => this.setTitle(e));

        return Promise.all(promises).then(() => true);
    }

    private async setTitle(item: TFileExplorerItem): Promise<void> {

        const title = await this.resolver.resolve(item.file);
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
