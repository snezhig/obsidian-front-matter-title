import Manager from "@src/Title/Manager/Manager";
import {MarkdownView, TAbstractFile, TFile} from "obsidian";
import SI from "@config/inversify.types";
import {inject, named} from "inversify";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";

export default class LinkNoteManager implements Manager {
    private enabled = false;

    constructor(
        @inject(SI['facade:obsidian'])
        private facade: ObsidianFacade,
        @inject(SI['resolver']) @named(Resolving.Sync)
        private resolver: ResolverInterface
    ) {
    }

    disable(): void {
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    async update(abstract?: TAbstractFile | null): Promise<boolean> {
        if (!this.isEnabled()) {
            return false;
        }
        const views = this.facade.getViewsOfType<MarkdownView>('markdown');
        if (!views.length) {
            return false;
        }
        const promises = [];
        for (const view of views) {
            if (view.file) {
                promises.push(this.process(view.file))
            }
        }

        return false;
    }

    private async process(file: TFile) {
        const links = this.facade.getFileLinksCache(file.path);
        const found: { [k: string]: { placeholder: string, file: TFile } } = {};
        for (const link of links) {
            if (!/^\[\[\w+\|*\w+]]$/.test(link.link) || found[link.link]) {
                continue;
            }
            const file = this.facade.getFirstLinkpathDest(link.link);
            if (file) {
                found[link.link] = {placeholder: link.original, file}
            }
        }
        const replace: [string, string][] = [];
        for (const item of Object.values(found)) {
            const title = this.resolver.resolve(item.file.path);
            if (title) {
                replace.push([title, item.placeholder]);
            }
        }
    }


}