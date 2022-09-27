import { debounce } from "ts-debounce";

type callback<Item, Return> = (items: Set<Item>) => Promise<Return>;

export default class Queue<Item, Return> {
    private readonly items: Set<Item>;
    private readonly cb: () => Promise<any>;

    constructor(cb: callback<Item, Return>, delay: number) {
        this.items = new Set<Item>();
        this.cb = debounce(async () => cb(this.items), delay);
    }

    public add(item: Item): Promise<Return> {
        this.items.add(item);
        return this.cb();
    }
}
