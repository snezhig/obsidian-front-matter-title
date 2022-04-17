import {TAbstractFile, TFile, Vault} from "obsidian";
import MetaTitleParser from "./MetaTitleParser";

type Item = {
	file: TFile,
	title: string,
	resolved: boolean
}
type Options = {
	ignoreEmpty: boolean,
	metaPath: string
}
export default class FileTitleResolver {
	private collection: Map<string, Item>;

	constructor(
		private vault: Vault,
		private options: Options
	) {
		this.collection = new Map();
		this.bind();
	}

	public async resolveTitle(abstract: TAbstractFile): Promise<string | null> {
		const item = this.getOrCreate(abstract);

		return item ? this.resolve(item) : null;
	}

	public async resolveTitleByPath(path: string): Promise<string | null> {
		if (!this.collection.has(path)) {
			this.getOrCreate(this.vault.getAbstractFileByPath(path));
		}

		const item = this.collection.get(path);
		return item ? this.resolve(item) : null;

	}

	private async resolve(item: Item): Promise<string> {
		if (!item.resolved) {
			const content = await item.file.vault.read(item.file);
			let title = await MetaTitleParser.parse(this.options.metaPath, content);

			if (title === null || (title === '' && this.options.ignoreEmpty)) {
				title = item.file.basename;
			}

			item.resolved = true;
			item.title = title;
		}

		return item.title;
	}


	private getOrCreate(abstract: TAbstractFile): Item | null {
		if (abstract instanceof TFile) {
			if (!this.collection.has(abstract.path)) {
				this.collection.set(abstract.path, {
					file: abstract,
					title: null,
					resolved: false
				});
			}
			return this.collection.get(abstract.path);
		}

		return null;
	}

	private bind(): void {
		this.vault.on('modify', (file) => {
			const item = this.collection.get(file.path);
			if (item) {
				item.resolved = false;
			}
		});
		this.vault.on('delete', (f) => {
			this.collection.delete(f.path);
		});
	}

}
