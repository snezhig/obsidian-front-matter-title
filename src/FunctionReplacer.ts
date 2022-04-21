
export default class FunctionReplacer<T, K extends keyof T> {
	private vanilla = null;

	public constructor(
		private proto: T,
		private method: K
	) {
		this.valid();
	}

	public isReplaced(): boolean{
		return this.vanilla !== null;
	}

	private valid(): void {
		if (typeof this.proto[this.method] !== "function") {
			throw new Error(`Method ${this.method} is not a function`)
		}
	}

	public replace(e: (self: FunctionReplacer<T, K>, args: any[]) => any): boolean {
		if (this.vanilla !== null) {
			return false;
		}

		const self = this;
		this.vanilla = this.proto[this.method];
		this.proto[this.method] = function (...args) {
			return e.call(this, self, args);
		} as K;

		return true;
	}

	public restore(): void {
		if (this.vanilla !== null) {
			this.proto[this.method] = this.vanilla;
			this.vanilla = null;
		}
	}

	public getVanilla(): Function | null {
		return this.vanilla;
	}

}
