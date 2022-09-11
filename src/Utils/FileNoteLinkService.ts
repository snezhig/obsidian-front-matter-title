import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import SI from "@config/inversify.types";
import { inject, injectable } from "inversify";

type NoteLinks = { link: string; original: string; dest: string };
@injectable()
export default class FileNoteLinkService {
  constructor(
    @inject(SI["facade:obsidian"])
    private facade: ObsidianFacade
  ) {}

  public getNoteLinks(path: string): NoteLinks[] {
    const links = this.facade.getFileLinksCache(path);
    const result: NoteLinks[] = [];
    for (const link of links) {
      if (!/^\[\[\w+\|*\w+]]$/.test(link.original)) {
        continue;
      }
      const f = this.facade.getFirstLinkpathDest(link.link);
      result.push({ dest: f.path, link: link.link, original: link.original });
    }
    return result;
  }
}
