import { inject, injectable, named } from "inversify";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { Feature, Leaves } from "../../Enum";
import SI from "../../../config/inversify.types";
import LoggerInterface from "../../Components/Debug/LoggerInterface";
import { BacklinkViewExt } from "obsidian";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { EventDispatcher } from "../../Components/EventDispatcher/EventDispatcher";
import { AppEvents } from "../../Types";
import AbstractFeature from "../AbstractFeature";
import { ResolverInterface } from "../../Resolver/Interfaces";
import FeatureService from "../FeatureService";
import BacklinkHelper from "../../Utils/BacklinkHelper";

@injectable()
export default class BacklinkFeature extends AbstractFeature<Feature> {
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
        service: FeatureService,
        @inject(SI["backlink:helper"])
        private helper: BacklinkHelper
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
        this.ref = this.dispatcher.addListener({
            name: "file:open",
            cb: () => setTimeout(() => this.process(), 20),
        });
        this.process();
    }
    public disable(): void {
        this.enabled = false;
        if (this.ref) {
            this.dispatcher.removeListener(this.ref);
            this.ref = null;
            this.process(null, true);
        }
    }
    private process(path: string = null, restore = false): void {
        const view = this.facade.getViewsOfType<BacklinkViewExt>(Leaves.BL)[0] ?? null;
        if (view.backlink) {
            this.helper.processTitles(view.backlink, this.resolver, path, restore);
        }
    }

    getId(): Feature {
        return BacklinkFeature.getId();
    }
    static getId() {
        return Feature.Backlink;
    }
}
