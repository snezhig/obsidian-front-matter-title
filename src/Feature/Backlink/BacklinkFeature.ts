import { inject, injectable, named } from "inversify";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { Feature, Leaves } from "@src/Enum";
import SI from "../../../config/inversify.types";
import LoggerInterface from "../../Components/Debug/LoggerInterface";
import { BacklinkViewExt, MarkdownViewExt } from "obsidian";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { EventDispatcher } from "@src/Components/EventDispatcher/EventDispatcher";
import { AppEvents } from "@src/Types";
import AbstractFeature from "../AbstractFeature";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import FeatureService from "../FeatureService";

@injectable()
export default class BacklinkFeature extends AbstractFeature<Feature> {
    private enabled = false;
    private refs: [ListenerRef<"file:open">, ListenerRef<"metadata:cache:changed">] | never[] = [];
    private resolver: ResolverInterface;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.logger)
        @named("backlink")
        private logger: LoggerInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcher<AppEvents>,
        @inject(SI["feature:service"])
        service: FeatureService
    ) {
        super();
        this.resolver = service.createResolver(this.getId());
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    public enable(): void {
        this.enabled = this.facade.isInternalPluginEnabled(this.getId());
        this.logger.log(`Manager state is ${this.enabled}`);
        if (!this.enabled) {
            return;
        }
        this.refs = [
            this.dispatcher.addListener({
                name: "file:open",
                cb: () => setTimeout(() => this.process(), 20),
            }),
            this.dispatcher.addListener({
                name: "metadata:cache:changed",
                cb: () => setTimeout(() => this.process(), 20),
            }),
        ];
        this.process();
    }

    public disable(): void {
        this.enabled = false;
        if (this.refs.length) {
            this.refs.forEach(e => this.dispatcher.removeListener(e));
            this.refs = [];
            this.process(true);
        }
    }

    private process(restore = false): void {
        const view = this.facade.getViewsOfType<BacklinkViewExt>(Leaves.BL)[0] ?? null;
        const lookups = [view?.backlink?.backlinkDom.resultDomLookup ?? new Map()];
        this.facade
            .getViewsOfType<MarkdownViewExt>(Leaves.MD)
            .forEach(e => lookups.push(e?.backlinks?.backlinkDom?.resultDomLookup ?? new Map()));
        for (const lookup of lookups) {
            for (const [file, item] of lookup.entries()) {
                const node = item.containerEl.firstElementChild;
                const text = (restore ? null : this.resolver.resolve(file.path)) ?? file.basename;
                if (node.getText() !== text) {
                    item.containerEl.firstElementChild.setText(text);
                }
            }
        }
    }

    getId(): Feature {
        return BacklinkFeature.getId();
    }

    static getId() {
        return Feature.Backlink;
    }
}
