import SI from "@config/inversify.types";
import CacheInterface from "@src/Components/Cache/CacheInterface";
import { inject } from "inversify";
import ResolverStorageInterface from "./Interface/ResolverStorageInterface";

export default class ResolverStorage implements ResolverStorageInterface {
    constructor(
        @inject(SI.cache)
        private cache: CacheInterface
    ) {}

    get(path: string): string {
        return this.cache.getItem<string>(path).get() ?? null;
    }
    has(path: string): boolean {
        return this.cache.getItem(path).isHit();
    }
    set(path: string, value: string): void {
        this.cache.save(this.cache.getItem(path).set(value));
    }

    delete(path: string): void {
        this.cache.delete(path);
    }
}
