import Manager from "./Manager";
import {MarkdownViewExt, TAbstractFile, Workspace} from "obsidian";
import {Leaves} from "../../enum";
import Resolver from "../Resolver/Resolver";

export default class MarkdownManager implements Manager {
    private original = new Map<string, string>();
    private bound = false;
    private handlers = {
        'layout-change': () => this.update()
    };

    constructor(
        private workspace: Workspace,
        private resolver: Resolver
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
                this.setTitle(view, await this.resolver.resolve(view.file));
            } else if (!abstract) {
                promises.push(this.resolver.resolve(view.file).then(r => [view, r]));
            }
        }

        for (const [view, title] of await Promise.all(promises)) {
            this.setTitle(view as MarkdownViewExt, title as string | null);
        }

        return Promise.resolve(true);
    }

    private setTitle(view: MarkdownViewExt, title: string | null): void {
        const container = (view.titleContainerEl as HTMLDivElement);
        let el: HTMLDivElement = null;
        for (const i of Array.from(container.children)) {
            if (i.hasAttribute('data-ofmt') && i instanceof HTMLDivElement) {
                el = i;
                break;
            }
        }
        if (!title) {
            if (el) {
                container.removeChild(el);
            }
            view.titleEl.hidden = false;
            return;
        }
        if (title && el && el.innerText === title && !el.hidden) {
            return;
        }
        if (el === null) {
            el = document.createElement('div')
            el.className = 'view-header-title';
            el.dataset['ofmt'] = 'true';
            el.innerText = title;
            el.hidden = true;
            el.onclick = (e) => {
                el.hidden = true;
                view.titleEl.hidden = false;
                view.titleEl.focus();
                view.titleEl.onblur = () => {
                    view.titleEl.hidden = true;
                    el.hidden = false;
                }
            }
            container.appendChild(el);
        }

        el.innerText = title;
        el.hidden = false;
        view.titleEl.hidden = true;
        return;
    }

}