import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import SI from "@config/inversify.types";
import { inject, injectable } from "inversify";
import { TFile } from "obsidian";

export type NoteLink = { link: string; original: string; dest: string; alias: string | null };
@injectable()
export default class FileNoteLinkService {
    private readonly REGEXP = /^\[\[.+\]\]$/;
    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade
    ) {}

    public getNoteLinks(path: string): NoteLink[] {
        const links = this.facade.getFileLinksCache(path);
        console.log(links);
        const result: NoteLink[] = [];
        for (const link of links) {
            if (!this.REGEXP.test(link.original)) {
                continue;
            }
            const file = this.facade.getFirstLinkpathDest(link.link, path);
            if (file instanceof TFile === false) {
                continue;
            }
            result.push({
                dest: file.path,
                link: link.link,
                original: link.original,
                alias: link?.displayText ?? null,
            });
        }
        return result;
    }
}
