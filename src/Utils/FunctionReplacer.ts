
export default class FunctionReplacer<T, K extends keyof T, O> {
	private vanilla: T[K] = null;

	public constructor(
		private proto: T,
		private method: K,
		private args: O,
		private implementation: (args: O, defaultArgs: unknown[], vanilla: T[K]) => any
	) {
		this.valid();
	}

	public isEnabled(): boolean{
		return this.vanilla !== null;
	}

	private valid(): void {
		if (typeof this.proto[this.method] !== "function") {
			throw new Error(`Method ${this.method} is not a function`)
		}
	}

	public enable(): boolean {
		if (this.vanilla !== null) {
			return false;
		}

		const self = this;
		this.vanilla = this.proto[this.method];
		this.proto[this.method] = function (...args: unknown[]): unknown {
			return self.implementation.call(this, self.args, args, self.vanilla);
		} as unknown as T[K];

		return true;
	}

	public disable(): void {
		if (this.vanilla !== null) {
			this.proto[this.method] = this.vanilla;
			this.vanilla = null;
		}
	}
}
