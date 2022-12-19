export type ObjectItem = { [k: string | number]: any };
export type DynamicItem<T> = [T] extends [object] ? ObjectItemInterface<T> : PrimitiveItemInterface<T>;

export interface PrimitiveItemInterface<T> {
    value(): T;

    set(value: T): void;
}

export interface ObjectItemInterface<T extends ObjectItem> extends PrimitiveItemInterface<T> {
    get<K extends keyof T>(key: K): DynamicItem<T[K]>;
}

export interface KeyStorageInterface<T extends ObjectItem> {
    collect(): T;
    get<K extends keyof T>(key: K): DynamicItem<T[K]>;
    set(value: T): void;
}
