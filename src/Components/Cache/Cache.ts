import CacheInterface from "./CacheInterface";
import CacheItemInterface from "./CacheItemInterface";
import CacheItem from "./CacheItem";
import { injectable } from "inversify";
import ObjectHelper from "@src/Utils/ObjectHelper";

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

    save<T>(item: CacheItemInterface<T>): void {
        const key = item.getKey();
        const value = item.get();

        this.pool.delete(key);
        this.serialized.delete(key);

        if (this.isObject(value)) {
            if (!this.canBeSerialized(value as unknown as object)) {
                throw new Error("Object with functions can not be serialized");
            }
            this.serialized.set(key, JSON.stringify(value));
        } else {
            this.pool.set(key, value);
        }
    }

    private resolve<T>(key: string): T {
        if (this.pool.has(key)) {
            return this.pool.get(key);
        }
        return JSON.parse(this.serialized.get(key));
    }

    private isObject(value: unknown): boolean {
        return typeof value === "object" && ![null, undefined].includes(value);
    }

    private canBeSerialized(object: object): boolean {
        return !ObjectHelper.values(object).some(e =>
            this.isObject(e) ? !this.canBeSerialized(e) : typeof e === "function"
        );
    }
}
