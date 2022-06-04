import { MetadataCache, TAbstractFile} from "obsidian";
import Item from "./ResolverItem";
import MetaParser, {Meta} from "../MetaParser";
import PathTemplate from "../../PathTemplate/PathTemplateInterface";
import Factory from "../../PathTemplate/Factory";

type Options = {
    metaPath: string,
    excluded: string[]
}

export default class Resolver {
    private collection: Map<string, Item>;
    private options: Options;
    private listeners = new Map<string, (() => void)[]>();
    private template: PathTemplate = null;

    constructor(
        private cache: MetadataCache,
        options: Options
    ) {
        this.collection = new Map();
        this.options = {...options};
        this.template = Factory.create(this.options.metaPath);
    }

    private static getPathByAbstract(fileOrPath: TAbstractFile | string): string {
        return fileOrPath instanceof TAbstractFile ? fileOrPath.path : fileOrPath;
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
            for (const path of this.collection.keys()) {
                if (this.isExcluded(path)) {
                    this.collection.delete(path);
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

        this.collection.clear();

        this.options.metaPath = v;
        this.template = Factory.create(v);
        this.emit('unresolved');
    }

    public isSupported(path: string): boolean {
        return !this.isExcluded(path) && /\.md$/.test(path);
    }

    /**
     * @deprecated
     * @param value
     */
    public isResolved(value: TAbstractFile | string): boolean {
        const path = Resolver.getPathByAbstract(value);
        return this.collection.get(path)?.isResolved();
    }

    /**
     * @deprecated
     * @param value
     */
    public getResolved(value: TAbstractFile | string): string | null {
        const path = Resolver.getPathByAbstract(value);
        return this.collection.get(path)?.getResolved() ?? null;
    }

    public async resolve(fileOrPath: TAbstractFile | string): Promise<string | null> {
        const item = this.getOrCreate(Resolver.getPathByAbstract(fileOrPath))
        return item ? item.await() : null;
    }

    public revoke(fileOrPath: TAbstractFile | string): void {
        this.collection.delete(Resolver.getPathByAbstract(fileOrPath));
    }

    private emit(eventName: string): void {
        for (const listener of this.listeners.get(eventName) ?? []) {
            listener();
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

    private getOrCreate(path: string): Item | null {
        if (this.isSupported(path)) {
            if (!this.collection.has(path)) {
                const item = new Item();

                item.process(this.makeTitle(path));

                this.collection.set(path, item);

            }
            return this.collection.get(path);
        }

        return null;
    }

    private async makeTitle(path: string): Promise<string | null> {
        const metadata: Meta = this.cache.getCache(path)?.frontmatter ?? {};
        const paths = this.template.getMetaPaths();
        const parts = Object.fromEntries(paths.map(e => [e, MetaParser.parse(e, metadata)]));

        return this.template.buildTitle(parts);

    }
}
