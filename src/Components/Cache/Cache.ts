import CacheInterface from "./CacheInterface";

export default class Cache implements CacheInterface {
    private pool = new Map<string, any>();

    clear(): void {
        this.pool.clear();
    }

    delete(key: string): void {
        this.pool.delete(key);
    }

    get<T>(key: string): T | null {
        return this.pool.get(key) ?? null;
    }

    set<T>(key: string, value: T): void {
        this.pool.set(key, value);
    }
}