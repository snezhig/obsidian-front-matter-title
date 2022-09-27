import CacheInterface from "./CacheInterface";
import CacheItemInterface from "./CacheItemInterface";
import CacheItem from "./CacheItem";
import { injectable } from "inversify";

@injectable()
export default class Cache implements CacheInterface {
    private pool = new Map<string, any>();
    private serialized = new Map<string, string>();

    clear(): void {
        this.pool.clear();
        this.serialized.clear();
    }

    delete(key: string): void {
        this.pool.delete(key);
        this.serialized.delete(key);
    }

    getItem<T>(key: string): CacheItemInterface<T> {
        const isHit = this.pool.has(key) || this.serialized.has(key);
        const value = isHit ? this.resolve<T>(key) : null;
        return new CacheItem<T>(isHit, value, key);
    }

    private resolve<T>(key: string): T {
        if (this.pool.has(key)) {
            return this.pool.get(key);
        }
        return JSON.parse(this.serialized.get(key));
    }

    save<T>(item: CacheItemInterface<T>): void {
        const key = item.getKey();
        const value = item.get();

        this.pool.delete(key);
        this.serialized.delete(key);

        if (typeof value === "object") {
            this.serialized.set(key, JSON.stringify(value));
        } else {
            this.pool.set(key, value);
        }
    }
}
