import {TFile} from "obsidian";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import SI from "@config/inversify.types";
import {inject} from "inversify";

type NoteLinks = { link: string, original: string, dest: TFile };
export default class FileNoteLinkService {
    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade
    ) {
    }

    public getNoteLinks(path: string): NoteLinks[] {
        const links = this.facade.getFileLinksCache(path);
        const found: Set<string> = new Set;
        const result: NoteLinks[] = [];
        for (const link of links) {
            if (!/^\[\[\w+\|*\w+]]$/.test(link.link) || found.has(link.link)) {
                continue;
            }
            const f = this.facade.getFirstLinkpathDest(link.link);
            if (f) {
                result.push({dest: f, link: link.link, original: link.original});
                found.add(link.link);
            }
        }
        return result;
    }
}