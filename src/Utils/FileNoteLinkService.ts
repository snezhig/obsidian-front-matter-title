import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import SI from "@config/inversify.types";
import { inject, injectable } from "inversify";

export type NoteLink = { link: string; original: string; dest: string; alias: string | null };
@injectable()
export default class FileNoteLinkService {
    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade
    ) {}

    public getNoteLinks(path: string): NoteLink[] {
        const links = this.facade.getFileLinksCache(path);
        const result: NoteLink[] = [];
        for (const link of links) {
            if (!/^\[\[[\w\s]+(\|*[\w\s]+)*]]$/.test(link.original)) {
                continue;
            }
            const f = this.facade.getFirstLinkpathDest(link.link);
            if (f) {
                result.push({
                    dest: f.path,
                    link: link.link,
                    original: link.original,
                    alias: link?.displayText ?? null,
                });
            }
        }
        return result;
    }
}
