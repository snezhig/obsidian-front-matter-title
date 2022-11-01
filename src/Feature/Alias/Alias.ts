export default class Alias {
    private key: string | null;
    private changed = false;

    constructor(private cache: { [k: string]: any }) {
        this.parse();
    }

    private parse(): void {
        this.key = null;
        for (const key of Object.keys(this.cache)) {
            if (this.getPossibleKeys().includes(key)) {
                this.key = key;
            }
        }
    }

    private getPossibleKeys(): string[] {
        return ["alias", "aliases"];
    }

    public getKey(): string | null {
        return this.key;
    }

    public getValue(): string | string[] | null {
        return this.key ? this.cache[this.key] ?? null : null;
    }

    public setValue(alias: string | string[]): void {
        const key = this.key ?? this.getPossibleKeys()[0];
        this.changed = true;
        this.cache[key] = alias;
    }
    public isChanged(): boolean {
        return this.changed;
    }
}
