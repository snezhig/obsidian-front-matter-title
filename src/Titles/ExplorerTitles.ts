import {TAbstractFile, TFileExplorerView, TFileExplorerItem} from "obsidian";
import FileTitleResolver from "../FileTitleResolver";

export default class ExplorerTitles {
	private originTitles = new Map<string, string>();

	constructor(
		private explorerView: TFileExplorerView,
		private resolver: FileTitleResolver
	) {
	}

	public async updateTitle(abstract: TAbstractFile): Promise<void> {
		const item = this.explorerView.fileItems[abstract.path];
		if (item) {
			await this.setTitle(item);
		}
	}


	private async setTitle(item: TFileExplorerItem): Promise<void> {

		const title = await this.resolver.resolve(item.file);
		if (this.isTitleEmpty(title)) {
			if (this.originTitles.has(item.file.path)) {
				return this.restore(item);
			}
		}else if (item.titleInnerEl.innerText !== title) {
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

	public async initTitles(): Promise<void> {
		const promises = [];
		for (const item of Object.values(this.explorerView.fileItems)) {
			promises.push(this.setTitle(item));
		}
		await Promise.all(promises);
	}

	public restoreTitles(): void {
		Object.values(this.explorerView.fileItems).map(e => this.restore(e));
	}

	private restore(item: TFileExplorerItem): void {
		if (this.originTitles.has(item.file.path)) {
			item.titleInnerEl.innerText = this.originTitles.get(item.file.path);
		}
	}
}
