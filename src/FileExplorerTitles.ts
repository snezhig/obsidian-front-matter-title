import {TAbstractFile, TFile, TFileExplorer, TFileExplorerItem} from "obsidian";
import FileTitleResolver from "./FileTitleResolver";

export default class FileExplorerTitles {
	constructor(
		private explorer: TFileExplorer,
		private resolver: FileTitleResolver
	) {
	}

	public async updateTitle(abstract: TAbstractFile): Promise<void> {
		const file = this.explorer.fileItems[abstract.path];
		if (file) {
			await this.setTitle(file as TFileExplorerItem);
		}
	}

	private async setTitle(item: TFileExplorerItem): Promise<void> {

		const title = await this.resolver.resolveTitle(item.file);
		console.log(title);
		if (title !== null) {
			item.titleEl.innerText = title;
		}
	}

	public async initTitles(): Promise<void> {
		for (const item of Object.values(this.explorer.fileItems)) {
			await this.setTitle(item as TFileExplorerItem);
		}
	}

	public async restoreTitles(): Promise<void> {
		for (const item of Object.values(this.explorer.fileItems)) {
			if (item.file instanceof TFile) {
				item.titleEl.innerText = item.file.basename;
			}
		}
	}
}
