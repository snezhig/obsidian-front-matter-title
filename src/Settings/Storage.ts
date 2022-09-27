export interface PrimitiveItemInterface<T> {
    value(): T;

    set(v: T): void;
}

export interface ObjectItemInterface<T extends object> extends PrimitiveItemInterface<T> {
    get<K extends keyof T>(k: K): T[K] extends object ? ObjectItemInterface<T[K]> : PrimitiveItemInterface<T[K]>;
}

export default class Storage<T extends { [k: string]: any }> {
    private item: ObjectItemInterface<T>;

    constructor(data: T) {
        this.item = new StorageItem<T>(data);
    }

    public get<K extends keyof T>(
        k: K
    ): T[K] extends object ? ObjectItemInterface<T[K]> : PrimitiveItemInterface<T[K]> {
        return this.item.get(k);
    }

    public collect(): T {
        return this.item.value();
    }
}

class StorageItem<T extends { [k: string]: any }> implements ObjectItemInterface<T> {
    private items?: { [k: string]: ObjectItemInterface<any> | PrimitiveItemInterface<any> };
    private _value?: T;

    constructor(data: T) {
        this.set(data);
    }

    get<K extends keyof T>(k: K): T[K] extends object ? ObjectItemInterface<T[K]> : PrimitiveItemInterface<T[K]> {
        return this.items[k as string] as T[K] extends object
            ? ObjectItemInterface<T[K]>
            : PrimitiveItemInterface<T[K]>;
    }

    set(value: T): void {
        if (typeof value === "object" && !Array.isArray(value)) {
            this.items = {};
            for (const [k, v] of Object.entries(value)) {
                this.items[k] = new StorageItem(v as T[keyof T]);
            }
        } else {
            this._value = value;
        }
    }

    value(): T {
        if (this.items) {
            const data: { [k: string]: any } = {};
            for (const [k, v] of Object.entries(this.items)) {
                data[k] = v.value();
            }
            return data as T;
        }
        return this._value;
    }
}
