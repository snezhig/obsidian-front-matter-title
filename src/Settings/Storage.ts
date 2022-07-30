interface PrimitiveItemInterface<T> {
    value(): T;

    set(v: T): void;
}

interface ObjectItemInterface<T extends object> extends PrimitiveItemInterface<T> {
    get<K extends keyof T>(k: K): T[K] extends object ? ObjectItemInterface<T[K]> : PrimitiveItemInterface<T[K]>
}


export default class Storage<T extends object> {
    private item: ObjectItemInterface<T>;

    constructor(data: T) {
        this.item = new StorageItem<T>(data);
    }

    public get<K extends keyof T>(k: K): T[K] extends object ? ObjectItemInterface<T[K]> : PrimitiveItemInterface<T[K]> {
        return this.item.get(k);
    }

    public collect(): T {
        return this.item.value();
    }
}


class StorageItem<T extends object> implements ObjectItemInterface<T> {
    private items: {[K in keyof T]: ObjectItemInterface<any>|PrimitiveItemInterface<any>}
        = {} as {[K in keyof T]: ObjectItemInterface<any>|PrimitiveItemInterface<any>};

    constructor(data: T) {
        for (const [k, v] of Object.entries(data)) {
            if (typeof v === 'object') {
                this.items[k as keyof T] = new StorageItem(v);
            } else {
                this.items[k as keyof T] = new PrimitiveItem<unknown>(v);
            }
        }
    }

    get<K extends keyof T>(k: K): T[K] extends object ? ObjectItemInterface<T[K]> : PrimitiveItemInterface<T[K]> {
        return this.items[k] as  T[K] extends object ? ObjectItemInterface<T[K]> : PrimitiveItemInterface<T[K]>;
    }

    set(v: T): void {
    }

    value(): T {
        return undefined;
    }
}

class PrimitiveItem<T> implements PrimitiveItemInterface<T> {
    constructor(
        private _value: T
    ) {
    }

    set(v: T): void {
        this._value = v;
    }

    value(): T {
        return this._value;
    }

}