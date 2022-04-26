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
    metaPath: string
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

    public setMetaPath(v: string): void {
        if (this.options.metaPath === v) {
            return;
        }

        for (const item of this.collection.values()) {
            item.state = 'none';
        }

        this.options.metaPath = v;
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


    private getOrCreate(abstract: TAbstractFile): Item | null {
        if (abstract instanceof TFile) {
            if (!this.collection.has(abstract.path)) {
                this.collection.set(abstract.path, {
                    file: abstract,
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
