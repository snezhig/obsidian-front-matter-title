export type FunctionPropertyNames<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never }[keyof T] &
    string;
export type Implementation<Target, Method extends FunctionPropertyNames<Required<Target>>, O> = (
    args: O,
    defaultArgs: Target[Method] extends (...arg: any) => any ? Parameters<Target[Method]> : unknown[],
    vanilla: Target[Method]
) => any;
export default class FunctionReplacer<Target, Method extends FunctionPropertyNames<Required<Target>>, O> {
    private vanilla: Target[Method] | null = null;

    public constructor(
        private target: Target,
        private method: Method,
        private args: O,
        private implementation: Implementation<Target, Method, O>
    ) {
        this.valid();
    }

    private valid(): void {
        if (typeof this.target[this.method] !== "function") {
            throw new Error(`Method ${this.method} is not a function`);
        }
    }

    public enable(): boolean {
        if (this.vanilla !== null) {
            return false;
        }

        const self = this;
        this.vanilla = this.target[this.method];
        this.target[this.method] = function (...args: unknown[]): unknown {
            return self.implementation.call(this, self.args, args, self.vanilla);
        } as unknown as Target[Method];

        return true;
    }

    public disable(): void {
        if (this.vanilla !== null) {
            this.target[this.method] = this.vanilla;
            this.vanilla = null;
        }
    }

    public isEnabled(): boolean {
        return this.vanilla !== null;
    }

    public static create<Target, Method extends FunctionPropertyNames<Required<Target>>, O>(
        target: Target,
        method: Method,
        args: O,
        implementation: Implementation<Target, Method, O>
    ) {
        return new FunctionReplacer(target, method, args, implementation);
    }
}
