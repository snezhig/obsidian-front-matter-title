import FakeTitleElementService from "@src/Utils/FakeTitleElementService";

// The service works directly on DOM nodes, but the unit suite runs in the node
// environment. This stub covers the handful of DOM bits the service touches and
// lets the assertions look at what actually matters: which node is visible and
// which listeners are still attached.
class StubElement {
    public tagName = "DIV";
    public className = "";
    public tabIndex = 0;
    public textContent = "";
    public parentElement: StubElement | null = null;
    public readonly children: StubElement[] = [];
    public readonly listeners: [string, unknown][] = [];
    private readonly attributes = new Map<string, string>();
    private readonly properties = new Map<string, string>();

    public style = {
        setProperty: (name: string, value: string, priority?: string) =>
            this.properties.set(name, priority ? `${value} !${priority}` : value),
        removeProperty: (name: string) => this.properties.delete(name),
    };

    setText(text: string): void {
        this.textContent = text;
    }
    setAttribute(name: string, value: string): void {
        this.attributes.set(name, value);
    }
    getAttribute(name: string): string | null {
        return this.attributes.get(name) ?? null;
    }
    removeAttribute(name: string): void {
        this.attributes.delete(name);
    }
    addEventListener(name: string, cb: unknown): void {
        this.listeners.push([name, cb]);
    }
    removeEventListener(name: string, cb: unknown): void {
        const i = this.listeners.findIndex(([n, c]) => n === name && c === cb);
        if (i !== -1) {
            this.listeners.splice(i, 1);
        }
    }
    insertBefore(node: StubElement, ref: StubElement): StubElement {
        const i = this.children.indexOf(ref);
        this.children.splice(i === -1 ? this.children.length : i, 0, node);
        node.parentElement = this;
        return node;
    }
    remove(): void {
        const parent = this.parentElement;
        if (parent) {
            parent.children.splice(parent.children.indexOf(this), 1);
        }
        this.parentElement = null;
    }
    isHidden(): boolean {
        return this.properties.get("display") === "none !important";
    }
}

const asElement = (e: StubElement): HTMLElement => e as unknown as HTMLElement;

describe("FakeTitleElementService", () => {
    let service: FakeTitleElementService;
    let container: StubElement;
    let original: StubElement;

    // Obsidian polyfills these on the prototypes at runtime.
    beforeAll(() => {
        (global as any).document = { createElement: () => new StubElement() };
        (Array.prototype as any).contains ??= function (this: unknown[], value: unknown) {
            return this.includes(value);
        };
    });

    const create = (id: string, on: StubElement = original): StubElement => {
        const { element } = service.getOrCreate({ original: asElement(on), title: "Title", id });
        service.setVisible(id, true);
        return element as unknown as StubElement;
    };

    beforeEach(() => {
        service = new FakeTitleElementService();
        container = new StubElement();
        original = new StubElement();
        container.insertBefore(original, original);
    });

    it("shows the fake title and hides the original", () => {
        const fake = create("id-1");

        expect(fake.isHidden()).toBe(false);
        expect(original.isHidden()).toBe(true);
        expect(fake.textContent).toBe("Title");
    });

    it("makes the original visible again when the element is dropped (#285)", () => {
        create("id-1");

        service.removeExcept([]);

        expect(container.children).toEqual([original]);
        expect(original.isHidden()).toBe(false);
    });

    it("keeps the elements listed in removeExcept", () => {
        // Each id belongs to its own view, so each has its own original element.
        const other = new StubElement();
        container.insertBefore(other, original);
        const kept = create("id-1");
        create("id-2", other);

        service.removeExcept(["id-1"]);

        expect(container.children).toContain(kept);
        expect(kept.isHidden()).toBe(false);
        expect(original.isHidden()).toBe(true);
        expect(other.isHidden()).toBe(false);
    });

    it("detaches the listeners it put on the original", () => {
        service.getOrCreate({ original: asElement(original), title: "Title", id: "id-1", events: ["click", "hover"] });
        expect(original.listeners.map(([name]) => name)).toEqual(["blur", "mouseout"]);

        service.remove("id-1");

        expect(original.listeners).toEqual([]);
    });

    it("does not stack listeners across create/remove cycles", () => {
        for (let i = 0; i < 3; i++) {
            service.getOrCreate({ original: asElement(original), title: "Title", id: "id-1", events: ["click"] });
            service.remove("id-1");
        }

        expect(original.listeners).toEqual([]);
    });
});
