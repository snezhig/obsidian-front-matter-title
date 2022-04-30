import {TAbstractFile, TFile, Vault} from "obsidian";
import MetaTitleParser from "./MetaTitleParser";

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

	public canBeResolved(path: string): boolean {
		return !this.isExcluded(path);
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
		const file = this.getFileByAbstract(abstract);
		const item = file ? this.getOrCreate(file) : null;

		return item ? this.resolveTitle(item) : null;

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

	private isFileCompatible(abstract: TFile): boolean {
		return abstract.extension == 'md' && !this.isExcluded(abstract.path);
	}

	private getFileByAbstract(abstract: TAbstractFile | string | null): TFile | null {
		if (abstract instanceof TFile) {
			return abstract;
		} else if (typeof abstract === 'string') {
			if (this.collection.has(abstract)) {
				return this.collection.get(abstract).file;
			} else {
				return this.getFileByAbstract(this.vault.getAbstractFileByPath(abstract));
			}
		}
		return null;
	}

	private getOrCreate(file: TFile): Item | null {
		if (this.isFileCompatible(file)) {
			if (!this.collection.has(file.path)) {
				this.collection.set(file.path, {
					file: file,
					title: null,
					state: 'none',
					promise: null
				});
			}
			return this.collection.get(file.path);
		}

		return null;
	}
}
