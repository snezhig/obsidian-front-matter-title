export default interface CacheInterface {
    get<T>(key: string): T | null;

    set<T>(key: string, value: T): void;

    clear(): void;

    delete(key: string): void;
}