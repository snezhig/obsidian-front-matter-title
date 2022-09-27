import CacheItemInterface from "./CacheItemInterface";

export default class CacheItem<T> implements CacheItemInterface<T> {
    constructor(private _isHit: boolean, private value: T, private key: string) {}

    get(): T {
        return this.value;
    }

    isHit(): boolean {
        return this._isHit;
    }

    set(value: T): CacheItemInterface<T> {
        this.value = value;
        return this;
    }

    getKey(): string {
        return this.key;
    }
}
