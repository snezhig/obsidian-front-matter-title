import { TAbstractFile, TFile } from "obsidian";
import EventDispatcherInterface from "../../Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { ResolverInterface } from "../../Resolver/Interfaces";
import { AppEvents } from "../../Types";
import FileNoteLinkService from "../../Utils/FileNoteLinkService";
import { Feature } from "../../Enum";
import AbstractFeature from "../AbstractFeature";
import FeatureService from "../FeatureService";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { inject } from "inversify";
import SI from "../../../config/inversify.types";
import Event from "../../Components/EventDispatcher/Event";
import { NoteLinkChange } from "./NoteLinkTypes";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";

export default class NoteLinkFeature extends AbstractFeature<Feature> {
    private enabled = false;
    private resolver: ResolverInterface;
    private refs: ListenerRef<any>[] = [];
    constructor(
        @inject(SI["feature:service"])
        featureService: FeatureService,
        @inject(SI["service:note:link"])
        private service: FileNoteLinkService,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade
    ) {
        super();
        this.resolver = featureService.createResolver(this.getId());
    }
    disable(): void {
        this.refs.forEach(e => this.dispatcher.removeListener(e));
        this.refs = [];
        this.enabled = false;
    }
    enable(): void {
        this.refs.push(
            this.dispatcher.addListener<"metadata:cache:changed">({
                name: "metadata:cache:changed",
                cb: e => this.requestApprove(e.get().path),
            })
        );
        this.refs.push(
            this.dispatcher.addListener<"note:link:changes:execute">({
                name: "note:link:changes:execute",
                cb: e => this.executeChanges(e.get().path, e.get().changes),
            })
        );
        this.enabled = true;
    }

    private requestApprove(path: string): void {
        const links = this.service.getNoteLinks(path);
        console.log(links);
        const changes = [];
        for (const link of links) {
            const title = this.resolver.resolve(link.dest);
            if (title && title !== link.alias) {
                changes.push({
                    current: link.alias,
                    replace: title,
                });
            }
        }
        this.dispatcher.dispatch("note:link:changes:approve", new Event({ path, changes }));
        this.dispatcher.dispatch("note:link:changes:execute", new Event({ path, changes }));
    }

    private async executeChanges(path: string, changes: NoteLinkChange[]): Promise<void> {
        const file = this.facade.getTFile(path);
        let content = file instanceof TFile ? await this.facade.getFileContent(file) : null;
        if (!content) {
            return;
        }
        console.log(content);
        for (const { current, replace } of changes) {
            content = content.replace(current, replace);
        }
        console.log(content);
    }

    getId(): Feature {
        return NoteLinkFeature.getId();
    }
    isEnabled(): boolean {
        return this.enabled;
    }
    static getId(): Feature {
        return Feature.NoteLink;
    }
}
