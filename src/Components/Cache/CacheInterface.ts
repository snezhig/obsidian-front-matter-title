import CacheItemInterface from "./CacheItemInterface";

export default interface CacheInterface {
    getItem<T>(key: string): CacheItemInterface<T>;

    save<T>(item: CacheItemInterface<T>): void;

    clear(): void;

    delete(key: string): void;
}
