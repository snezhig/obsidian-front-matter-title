import {TAbstractFile, TFile, Vault} from "obsidian";
import MetaTitleParser from "./MetaTitleParser";
import {Obj} from "tern";

type Item = {
	file: TFile,
	title: string,
	state: 'resolved' | 'process' | 'none',
	promise: Promise<string | null> | null
}
type Options = {
	metaPath: string,
	excluded: string[]
}
export default class FileTitleResolver {
	private collection: Map<string, Item>;
	private options: Options;

	constructor(
		private vault: Vault,
		options: Options
	) {
		this.collection = new Map();
		this.options = {...options};
	}

	//TODO: replace return with event logic
	public setExcluded(v: string[]): boolean {
		let hasDiff = this.options.excluded.some(e => !v.includes(e));
		hasDiff = hasDiff ? hasDiff : !v.some(e => this.options.excluded.includes(e));
		if (hasDiff === false) {
			return false;
		}

		this.options.excluded = v;

		let hasReset = false;
		for (const [k, v] of this.collection.entries()) {
			if (this.isExcluded(v.file.path)) {
				this.collection.delete(k);
				hasReset = true;
			}
		}

		return hasReset;
	}



	public setMetaPath(v: string): boolean {
		if (this.options.metaPath === v) {
			return false;
		}

		for (const item of this.collection.values()) {
			item.state = 'none';
			item.title = null;
		}

		this.options.metaPath = v;
		return true;
	}

	public isResolved(value: TAbstractFile | string): boolean {
		const path = value instanceof TAbstractFile ? value.path : value;
		return this.collection.get(path)?.state === 'resolved';
	}

	public getResolved(value: TAbstractFile | string): string | null {
		const path = value instanceof TAbstractFile ? value.path : value;
		return this.collection.get(path)?.title ?? null;
	}

	public async resolve(abstract: TAbstractFile | string): Promise<string | null> {
		const item = abstract instanceof TAbstractFile
			? this.getOrCreate(abstract)
			: this.getOrCreateByPath(abstract);
		return item ? this.resolveTitle(item) : null;

	}

	private getOrCreateByPath(path: string): Item | null {
		if (!this.collection.has(path)) {
			this.getOrCreate(this.vault.getAbstractFileByPath(path));
		}
		return this.collection.get(path);
	}

	private async resolveTitle(item: Item): Promise<string | null> {
		switch (item.state) {
			case 'resolved':
				return item.title;
			case "process":
				return item.promise;
			case "none": {
				item.state = 'process';
				item.promise = new Promise<string>(async (r) => {
					const content = await item.file.vault.read(item.file);
					let title = await MetaTitleParser.parse(this.options.metaPath, content);

					if (title === null || title === '') {
						title = null;
					}

					item.title = title;
					item.state = 'resolved';
					item.promise = null;
					r(item.title);
				});
				return await item.promise;
			}
		}

	}

	private isExcluded(path: string): boolean {
		for (const excluded of this.options.excluded) {
			const regExp = new RegExp(`^${excluded}`);
			if (regExp.test(path)) {
				return true;
			}
		}
		return false;
	}

	private isAbstractCompatible(abstract: TAbstractFile): boolean {
		return abstract instanceof TFile
			&& abstract.extension == 'md'
			&& !this.isExcluded(abstract.path);
	}

	private getOrCreate(abstract: TAbstractFile): Item | null {
		if (this.isAbstractCompatible(abstract)) {
			if (!this.collection.has(abstract.path)) {
				this.collection.set(abstract.path, {
					file: abstract as TFile,
					title: null,
					state: 'none',
					promise: null
				});
			}
			return this.collection.get(abstract.path);
		}

		return null;
	}

	public handleModify(file: TAbstractFile): void {
		const item = this.collection.get(file.path);
		if (item) {
			item.state = 'none';
		}
	}

	public handleDelete(file: TAbstractFile): void {
		this.collection.delete(file.path);
	}
}
