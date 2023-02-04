import { injectable } from "inversify";

@injectable()
export default class FakeTitleElementService {
    private readonly attr = {
        fake: "ofmt-fake-id",
        original: "ofmt-original-id",
    };
    private elements: Map<string, { original: HTMLElement; fake: HTMLElement; events: string[] }> = new Map();

    private events = {
        click: (e: Event) => {
            const id = this.extractId(e.target);
            this.setVisible(id, false).getOriginal(id).focus();
        },
        blur: (e: Event) => this.setVisible(this.extractId(e.target), true),
        hover: (e: Event) => this.setVisible(this.extractId(e.target), false),
        out: (e: Event) => this.setVisible(this.extractId(e.target), true),
    };

    private extractId(e: any): string | null {
        if (e instanceof HTMLElement) {
            return e.getAttribute(this.attr.fake) ?? e.getAttribute(this.attr.original);
        }
        return null;
    }

    private getOriginal(id: string): HTMLElement | null {
        return this.elements.get(id)?.original ?? null;
    }

    private has(id: string): boolean {
        return this.elements.has(id);
    }

    remove(id: string): void {
        if (!this.has(id)) {
            return;
        }
        this.setVisible(id, false);
        const { fake, events, original } = this.elements.get(id);
        this.elements.get(id)?.events.forEach(e => {
            if (e === "click") {
                original.removeEventListener("click", this.events.blur);
            }
            if (e === "hober") {
                original.removeEventListener("mouseout", this.events.out);
            }
        });
        original.removeAttribute(this.attr.original);
        fake.remove();
        this.elements.delete(id);
    }

    removeAll(): void {
        Array.from(this.elements.keys()).forEach(e => this.remove(e));
    }

    getOrCreate<T extends HTMLElement>({
        original,
        title,
        id,
        events = [],
    }: {
        original: HTMLElement;
        title: string;
        id: string;
        events?: ("click" | "hover")[];
    }): { created: boolean; element: T } {
        const container = original?.parentElement;
        if (!container) {
            return;
        }
        let element = this.find(container, id) as T;
        if (element) {
            element.setText(title);
            return { created: false, element };
        }

        element = document.createElement(original.tagName) as T;
        element.className = original.className;
        element.setText(title);
        element.setAttribute(this.attr.fake, id);
        original.setAttribute(this.attr.original, id);
        this.elements.set(id, { original, fake: element, events: [...events] });

        if (events.contains("click")) {
            this.bindClick(id);
        }
        if (events.contains("hover")) {
            this.bindHover(id);
        }

        container.insertBefore(element, original);

        return { created: true, element };
    }

    public setVisible(id: string, visible: boolean): this {
        if (this.elements.has(id)) {
            const { fake, original } = this.elements.get(id);
            original.hidden = visible;
            fake.hidden = !visible;
        }
        return this;
    }

    private bindClick(id: string): void {
        if (this.has(id)) {
            const { fake, original } = this.elements.get(id);
            fake.addEventListener("click", this.events.click);
            original.addEventListener("blur", this.events.blur);
        }
    }

    private bindHover(id: string): void {
        if (this.has(id)) {
            const { fake, original } = this.elements.get(id);
            fake.addEventListener("mouseover", this.events.click);
            original.addEventListener("mouseout", this.events.blur);
        }
    }

    private find(container: HTMLElement, id: string): HTMLElement | null {
        for (const node of Array.from(container.children)) {
            const cId = node.getAttribute(this.attr.fake);
            if (id === cId && node instanceof HTMLElement) {
                return node;
            }
        }
        return null;
    }
}
