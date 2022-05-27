import Manager from "./Manager";
import {MarkdownViewExt, TAbstractFile, Workspace} from "obsidian";
import {Leaves} from "../../enum";
import Resolver from "../Resolver/Resolver";

export default class MarkdownManager implements Manager {
    private original = new Map<string, string>();

    constructor(
        private workspace: Workspace,
        private resolver: Resolver
    ) {
    }

    private enabled: boolean = false;

    disable(): void {
        for(const leaf of this.workspace.getLeavesOfType(Leaves.MD)){
            this.setTitle(leaf.view as MarkdownViewExt, null);
        }
        this.original.clear();
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    async update(abstract?: TAbstractFile | null): Promise<boolean> {
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
        if (title) {
            this.original.set(view.file.path, view.titleEl.innerText);
            view.titleEl.innerText = title;
        } else if (this.original.has(view.file.path)) {
            view.titleEl.innerText = this.original.get(view.file.path);
        }
    }

}