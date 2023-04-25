import EventDispatcherInterface from "../../Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import { AppEvents } from "@src/Types";
import FileNoteLinkService from "@src/Utils/FileNoteLinkService";
import { Feature } from "@src/Enum";
import AbstractFeature from "../AbstractFeature";
import FeatureService from "../FeatureService";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { inject, named } from "inversify";
import SI from "../../../config/inversify.types";
import Event from "../../Components/EventDispatcher/Event";
import { NoteLinkChange, NoteLinkStrategy } from "./NoteLinkTypes";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { TFile } from "obsidian";
import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { FeatureConfig } from "../Types";

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
        @inject(SI["listener"])
        @named(NoteLinkFeature.getId())
        private listener: ListenerInterface,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["feature:config"])
        @named(Feature.NoteLink)
        private config: FeatureConfig<Feature.NoteLink>
    ) {
        super();
        this.resolver = featureService.createResolver(this.getId());
    }

    disable(): void {
        this.listener.unbind();
        this.refs.forEach(e => this.dispatcher.removeListener(e));
        this.refs = [];
        this.enabled = false;
    }

    enable(): void {
        this.listener.bind();
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
        const changes = [];
        for (const link of links) {
            const title = this.resolver.resolve(link.dest);
            const hasAlias = /.+\|.+/.test(link.original);
            if (this.config.strategy === NoteLinkStrategy.All || !hasAlias) {
                if (title && title !== link.alias) {
                    changes.push({
                        original: link.original,
                        replace: `[[${link.link}|${title}]]`,
                    });
                }
            }
        }
        if (changes.length) {
            this.dispatcher.dispatch("note:link:changes:approve", new Event({ path, changes }));
        }
    }

    private async executeChanges(path: string, changes: NoteLinkChange[]): Promise<void> {
        const file = this.facade.getTFile(path);
        let content = file instanceof TFile ? await this.facade.getFileContent(file) : null;
        if (!content) {
            return;
        }
        for (const { original, replace } of changes) {
            content = content.replace(original, replace);
        }
        this.facade.modifyFile(file, content).catch(console.error);
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
