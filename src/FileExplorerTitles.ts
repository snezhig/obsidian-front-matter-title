import {TAbstractFile, TFile, TFileExplorer, TFileExplorerItem} from "obsidian";
import FileTitleResolver from "./FileTitleResolver";

export default class FileExplorerTitles {
	private originTitles = new Map<string, string>();

	constructor(
		private explorer: TFileExplorer,
		private resolver: FileTitleResolver
	) {
	}

	public async updateTitle(abstract: TAbstractFile): Promise<void> {
		const item = this.explorer.fileItems[abstract.path];
		if (item) {
			await this.setTitle(item);
		}
	}

	private async setTitle(item: TFileExplorerItem): Promise<void> {

		const title = await this.resolver.resolve(item.file);
		if (this.canUpdateTitle(title)) {
			this.keepOrigin(item);
			item.titleEl.innerText = title;
		}
	}

	private canUpdateTitle(title: string): boolean {
		return title !== null && title !== '';
	}

	private keepOrigin(item: TFileExplorerItem): void{
		if(!this.originTitles.has(item.file.path)){
			this.originTitles.set(item.file.path, item.titleEl.innerText);
		}
	}

	public async initTitles(): Promise<void> {
		const promises = [];
		for (const item of Object.values(this.explorer.fileItems)) {
			promises.push(this.setTitle(item));
		}
		await Promise.all(promises);
	}

	public restoreTitles(): void {
		for (const item of Object.values(this.explorer.fileItems)) {
			if (this.originTitles.has(item.file.path)) {
				item.titleEl.innerText = this.originTitles.get(item.file.path);
			}
		}
	}
}
