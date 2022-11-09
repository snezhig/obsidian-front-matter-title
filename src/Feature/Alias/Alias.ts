export default class Alias {
    private changed = false;
    private original: {
        key: string | null;
        value: string | string[] | null;
    } = undefined;

    constructor(private cache: { [k: string]: any }) {}

    private getPossibleKeys(): string[] {
        return ["alias", "aliases"];
    }

    public getKey(): string | null {
        for (const key of Object.keys(this.cache)) {
            if (this.getPossibleKeys().includes(key)) {
                return key;
            }
        }
        return null;
    }

    public getValue(): string | string[] | null {
        return this.cache[this.getKey()] ?? null;
    }

    public setValue(alias: string | string[]): void {
        if (this.original === undefined) {
            const value = this.getValue();
            this.original = {
                value: Array.isArray(value) ? [...value] : value,
                key: this.getKey(),
            };
        }
        this.modify(alias);
        this.changed = true;
    }

    public isChanged(): boolean {
        return this.changed;
    }

    public restore(): void {
        const key = this.getKey();
        if (this.original.key === null && key) {
            delete this.cache[key];
        } else if (this.original.key) {
            this.modify(this.original.value);
        }
        this.changed = false;
    }

    private modify(alias: string | string[]): void {
        const key = this.getKey() ?? this.getPossibleKeys()[0];
        this.cache[key] = alias;
    }
}
