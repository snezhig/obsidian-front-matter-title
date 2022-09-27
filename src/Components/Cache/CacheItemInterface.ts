export default interface CacheItemInterface<T> {
    isHit(): boolean;

    get(): T;

    set(value: T): CacheItemInterface<T>;

    getKey(): string;
}
