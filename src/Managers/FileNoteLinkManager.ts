import { MarkdownView, TAbstractFile, TFile } from "obsidian";
import SI from "@config/inversify.types";
import { inject, injectable, named } from "inversify";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import FileNoteLinkService from "@src/Utils/FileNoteLinkService";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import Event from "@src/Components/EventDispatcher/Event";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import ManagerInterface from "@src/Interfaces/ManagerInterface";
import { Manager } from "@src/enum";

@injectable()
export default class LinkNoteManager implements ManagerInterface {
  private enabled = false;

  constructor(
    @inject(SI["facade:obsidian"])
    private facade: ObsidianFacade,
    @inject(SI["resolver"])
    @named(Resolving.Sync)
    private resolver: ResolverInterface,
    @inject(SI["service:note:link"])
    private service: FileNoteLinkService,
    @inject(SI.dispatcher)
    private dispatcher: DispatcherInterface<AppEvents>,
    @inject(SI.logger)
    @named("manager:note:links")
    private logger: LoggerInterface
  ) {}
  public getId(): Manager {
    return Manager.FileNoteLink;
  }

  async disable(): Promise<void> {
    this.enabled = false;
  }

  async enable(): Promise<void> {
    this.enabled = true;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async update(path: string | null = null): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }
    const views = this.facade.getViewsOfType<MarkdownView>("markdown");
    if (!views.length) {
      return false;
    }
    const promises = [];
    for (const view of views) {
      if (view.file && (path === null || path === view.file.path)) {
        promises.push(this.process(view.file));
      }
    }
    await Promise.all(promises);
    return false;
  }

  public async process(file: TFile) {
    const links = this.dispatcher.dispatch("note:link:filter", new Event({ links: this.service.getNoteLinks(file.path) })).get().links;

    const replace: [string, string][] = [];
    const resolved: Map<string, string> = new Map();
    for (const item of links) {
      const title = resolved.has(item.dest) ? resolved.get(item.dest) : this.resolver.resolve(item.dest);
      resolved.set(item.dest, title);
      if (title) {
        replace.push([`[[${item.link}|${title}]]`, item.original]);
      }
    }
    if (replace.length === 0) {
      return;
    }
    this.logger.log(`Request approval for ${file.path}`);
    const approved = await this.dispatcher
      .dispatch(
        "note:link:change:approve",
        new Event({
          path: file.path,
          changes: replace,
          approve: Promise.resolve(false),
        })
      )
      .get().approve;

    if (!approved) {
      this.logger.log(`Changes for ${file.path} have been rejected`);
      return;
    }

    let content = await this.facade.getFileContent(file);
    for (const [v, r] of replace) {
      content = content.replace(r, v);
    }
    await this.facade.modifyFile(file, content);
  }
}
