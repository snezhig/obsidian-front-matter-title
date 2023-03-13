import { inject, injectable, named } from "inversify";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { Feature } from "../../enum";
import SI from "../../../config/inversify.types";
import LoggerInterface from "../../Components/Debug/LoggerInterface";
import { BacklinkViewExt } from "obsidian";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { EventDispatcher } from "../../Components/EventDispatcher/EventDispatcher";
import { AppEvents } from "../../Types";
import AbstractFeature from "../AbstractFeature";
import { ResolverInterface } from "../../Resolver/Interfaces";
import FeatureService from "../FeatureService";

@injectable()
export default class BacklinkManager extends AbstractFeature<Feature> {
    private enabled = false;
    private ref: ListenerRef<"file:open"> = null;
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
        if (this.enabled) {
            this.ref = this.dispatcher.addListener({
                name: "file:open",
                cb: () => setTimeout(() => this.process(), 20),
            });
        }
        this.process();
    }
    public disable(): void {
        this.enabled = false;
        if (this.ref) {
            this.dispatcher.removeListener(this.ref);
            this.ref = null;
        }
    }
    private process(path: string = null): void {
        const view = this.facade.getViewsOfType<BacklinkViewExt>(this.getId())[0] ?? null;
        const lookup = view?.backlink?.backlinkDom?.resultDomLookup ?? new Map();

        for (const [file, item] of lookup.entries()) {
            if (path && file.path !== path) {
                continue;
            }
            const node = item.containerEl.firstElementChild;
            const text = this.resolver.resolve(file.path) ?? file.basename;
            if (node.getText() !== text) {
                item.containerEl.firstElementChild.setText(text);
            }
        }
    }

    getId(): Feature {
        return BacklinkManager.getId();
    }
    static getId() {
        return Feature.Backlink;
    }
}
