import {debounce} from "obsidian";

type callback<Item> = (items: Set<Item>) => void;

export default class Queue<Item> {
	private readonly items: Set<Item>;
	private readonly cb: () => void;

	constructor(
		cb: callback<Item>,
		delay: number
	) {
		this.items = new Set<Item>();
		this.cb = debounce(() => cb(this.items), delay);
	}

	public add(item: Item): void {
		this.items.add(item);
		this.cb();
	}
}
