import {CachedMetadata, MetadataCache, TAbstractFile, TFile, Vault} from "obsidian";
import MetaTitleParser from "./MetaTitleParser";

type Item = {
    title: string,
    state: 'resolved' | 'process' | 'none',
    promise: Promise<string | null> | null,
    path: string,
}
type Options = {
    metaPath: string,
    excluded: string[]
}

export default class FileTitleResolver {
    private collection: Map<string, Item>;
    private options: Options;
    private listeners = new Map<string, Function[]>();

    constructor(
        private cache: MetadataCache,
        options: Options
    ) {
        this.collection = new Map();
        this.options = {...options};
    }

    public on(eventName: 'unresolved', listener: () => void): this {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(listener);
        return this;
    }

    public removeAllListeners(eventName: string): void {
        this.listeners.delete(eventName);
    }

    public setExcluded(v: string[]): void {
        let emit = this.options.excluded.some(e => !v.includes(e));

        const hasNew = v.some(e => !this.options.excluded.includes(e));

        if (emit || hasNew) {
            this.options.excluded = v;
        }

        if (hasNew) {
            for (const [k, v] of this.collection.entries()) {
                if (this.isExcluded(v.path)) {
                    this.collection.delete(k);
                    emit = true;
                }
            }
        }

        if (emit) {
            this.emit('unresolved');
        }
    }

    public setMetaPath(v: string): void {
        if (this.options.metaPath === v) {
            return;
        }

        for (const item of this.collection.values()) {
            item.state = 'none';
            item.title = null;
        }

        this.options.metaPath = v;
        this.emit('unresolved');
    }

    public canBeResolved(path: string): boolean {
        return !this.isExcluded(path) && /\.md$/.test(path);
    }

    public isResolved(value: TAbstractFile | string): boolean {
        const path = FileTitleResolver.getPathByAbstract(value);
        return this.collection.get(path)?.state === 'resolved';
    }

    public getResolved(value: TAbstractFile | string): string | null {
        const path = FileTitleResolver.getPathByAbstract(value);
        return this.collection.get(path)?.title ?? null;
    }

    public async resolve(abstract: TAbstractFile | string): Promise<string | null> {
        const item = this.getOrCreate(FileTitleResolver.getPathByAbstract(abstract))
        return item ? this.resolveTitle(item) : null;

    }

    public handleCacheChanged(file: TAbstractFile): void {
        const item = this.collection.get(file.path);
        if (item) {
            item.state = 'none';
        }
    }

    public handleDelete(file: TAbstractFile): void {
        this.collection.delete(file.path);
    }

    private emit(eventName: string): void {
        for (const listener of this.listeners.get(eventName) ?? []) {
            listener();
        }
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
                    const metadata: CachedMetadata = this.cache.getCache(item.path) ?? {};
                    let title = await MetaTitleParser.parse(this.options.metaPath, metadata);

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

    private static getPathByAbstract(abstract: TAbstractFile | string ): string {
        return abstract instanceof TAbstractFile ? abstract.path : abstract;
    }

    private getOrCreate(path: string): Item | null {
        if (this.canBeResolved(path)) {
            if (!this.collection.has(path)) {
                this.collection.set(path, {
                    title: null,
                    state: 'none',
                    promise: null,
                    path: path
                });
            }
            return this.collection.get(path);
        }

        return null;
    }
}
