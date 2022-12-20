import ObjectHelper from "@src/Utils/ObjectHelper";
import {
    ObjectItem,
    ObjectItemInterface,
    DynamicItem,
    KeyStorageInterface,
    PrimitiveItemInterface,
} from "./Interfaces";

export default class Storage<T extends ObjectItem> implements KeyStorageInterface<T> {
    private item: ObjectItemInterface<T>;

    constructor(data: T) {
        this.set(data);
    }

    public get<K extends keyof T>(k: K): DynamicItem<T[K]> {
        return this.item.get(k);
    }

    public set(value: T): void {
        this.item = new StorageObjectItem<T>(value);
    }

    public collect(): T {
        return this.item.value();
    }
}

const create = <T>(value: T): DynamicItem<T> => {
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        return new StorageObjectItem(value);
    } else {
        return new StoragePrimitiveItem(value) as unknown as DynamicItem<T>;
    }
};

class StorageObjectItem<T extends ObjectItem> implements ObjectItemInterface<T> {
    private items?: { [K in keyof T]: DynamicItem<T[K]> } = null;

    constructor(data: T) {
        this.set(data);
    }

    get<K extends keyof T>(key: K): DynamicItem<T[K]> {
        return this.items[key];
    }

    set(value: T): void {
        this.items = {} as { [K in keyof T]: DynamicItem<T[K]> };
        for (const [key, v] of ObjectHelper.entries(value)) {
            this.items[key] = create(v);
        }
    }

    value(): T {
        const data: T = {} as T;
        for (const [k, v] of ObjectHelper.entries(this.items)) {
            data[k] = v.value();
        }
        return data as T;
    }
}

class StoragePrimitiveItem<T> implements PrimitiveItemInterface<T> {
    constructor(private data: T) {}
    value(): T {
        return this.data;
    }
    set(value: T): void {
        this.data = value;
    }
}
