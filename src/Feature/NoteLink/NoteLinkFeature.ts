import { TFile } from "obsidian";
import EventDispatcherInterface from "../../Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { ResolverInterface } from "../../Resolver/Interfaces";
import { AppEvents } from "../../Types";
import FileNoteLinkService from "../../Utils/FileNoteLinkService";
import { Feature } from "../../enum";
import AbstractFeature from "../AbstractFeature";
import FeatureService from "../FeatureService";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { inject } from "inversify";
import SI from "../../../config/inversify.types";

export default class NoteLinkFeature extends AbstractFeature<Feature> {
    private enabled = false;
    private resolver: ResolverInterface;
    private ref: ListenerRef<"file:open">;
    constructor(
        @inject(SI["feature:service"])
        featureService: FeatureService,
        @inject(SI["service:note:link"])
        private service: FileNoteLinkService,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>
    ) {
        super();
        this.resolver = featureService.createResolver(this.getId());
    }
    disable(): void {
        if (this.ref) {
            this.dispatcher.removeListener(this.ref);
            this.ref = null;
        }
        this.enabled = false;
    }
    enable(): void {
        this.ref = this.dispatcher.addListener({
            name: "file:open",
            cb: e => e.get() && this.process(e.get()),
        });
        this.enabled = true;
    }

    private process(file: TFile): void {
        const links = this.service.getNoteLinks(file.path);
        console.log(links);
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
