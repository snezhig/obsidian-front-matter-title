import Manager from "./Manager";
import {MarkdownViewExt, TAbstractFile, Workspace} from "obsidian";
import {Leaves} from "../../enum";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";

export default class MarkdownManager implements Manager {
    private original = new Map<string, string>();
    private bound = false;
    private handlers = {
        'layout-change': () => this.update(),
        'mousedown': (e: Event) => e.preventDefault()
    };

    constructor(
        private workspace: Workspace,
        private resolver: ResolverInterface<Resolving.Async>
    ) {
    }

    private enabled = false;

    disable(): void {
        for (const leaf of this.workspace.getLeavesOfType(Leaves.MD)) {
            this.setTitle(leaf.view as MarkdownViewExt, null);
        }
        this.original.clear();
        this.enabled = false;
        if (this.bound) {
            this.workspace.off('layout-change', this.handlers['layout-change']);
            this.bound = false;
        }
    }

    enable(): void {
        this.enabled = true;
        if (!this.bound) {
            this.workspace.on('layout-change', this.handlers['layout-change']);
            this.bound = true;
        }
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    async update(abstract?: TAbstractFile | null): Promise<boolean> {
        if (!this.isEnabled()) {
            return Promise.resolve(false);
        }
        const leaves = this.workspace.getLeavesOfType(Leaves.MD);
        const promises = [];

        for (const leaf of leaves) {
            const view: MarkdownViewExt = (leaf.view as MarkdownViewExt);
            if (view.file.path === abstract?.path) {
                this.setTitle(view, await this.resolver.resolve(view.file.path));
            } else if (!abstract) {
                promises.push(this.resolver.resolve(view.file.path).then(r => [view, r]));
            }
        }

        for (const [view, title] of await Promise.all(promises)) {
            this.setTitle(view as MarkdownViewExt, title as string | null);
        }

        return Promise.resolve(true);
    }

    private setTitle(view: MarkdownViewExt, title: string | null): void {
        if (title && title !== view.titleEl.innerText) {
            this.original.set(view.file.path, view.titleEl.innerText);
            view.titleEl.innerText = title;
            view.titleEl.contentEditable = 'false';
            view.titleEl.addEventListener('mousedown', this.handlers.mousedown);

        } else if (!title && this.original.has(view.file.path)) {
            view.titleEl.innerText = this.original.get(view.file.path);
            view.titleEl.contentEditable = 'true';
            view.titleEl.removeEventListener('mousedown', this.handlers.mousedown);
        }
    }

}