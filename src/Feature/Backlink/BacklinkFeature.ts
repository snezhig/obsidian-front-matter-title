import { inject, injectable, named } from "inversify";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { Feature, Leaves, Plugins } from "@src/Enum";
import SI from "../../../config/inversify.types";
import LoggerInterface from "../../Components/Debug/LoggerInterface";
import { BacklinkViewExt, MarkdownViewExt } from "obsidian";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { EventDispatcher } from "@src/Components/EventDispatcher/EventDispatcher";
import { AppEvents } from "@src/Types";
import AbstractFeature from "../AbstractFeature";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import FeatureService from "../FeatureService";
import SearchDomWrapperService from "../../Utils/SearchDomWrapperService";

@injectable()
export default class BacklinkFeature extends AbstractFeature<Feature> {
    private enabled = false;
    private refs: ListenerRef<keyof AppEvents>[] | never[] = [];
    private resolver: ResolverInterface;
    private dProcess: () => void = null;
    private timer: number = null;
    private isBacklinkWrapped = false;

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
        @inject(SI["service:search:dom:wrapper"])
        private mutateService: SearchDomWrapperService
    ) {
        super();
        this.resolver = service.createResolver(this.getId());
        this.dProcess = () => {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = window.setTimeout(this.process.bind(this), 50);
        };
    }

    static getId() {
        return Feature.Backlink;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    public enable(): void {
        this.enabled = this.facade.isInternalPluginEnabled(Plugins.Backlink);
        this.logger.log(`Manager state is ${this.enabled}`);
        if (!this.enabled) {
            return;
        }
        this.refs = [
            this.dispatcher.addListener({
                name: "metadata:cache:changed",
                cb: this.dProcess.bind(this),
            }),
            this.dispatcher.addListener({
                name: "layout:change",
                cb: this.dProcess.bind(this),
            }),
        ];
        this.process();
    }

    public disable(): void {
        this.enabled = false;
        if (this.refs.length) {
            this.refs.forEach(e => this.dispatcher.removeListener(e));
            this.refs = [];
            this.mutateService.destroyByTag(this.getId());
        }
    }

    getId(): Feature {
        return BacklinkFeature.getId();
    }

    private process(): void {
        this.logger.log("process");
        this.processBacklinkLayout();

        for (const view of this.facade.getViewsOfType<MarkdownViewExt>(Leaves.MD)) {
            const dom = view?.backlinks?.backlinkDom;
            if (dom) {
                this.mutateService.wrapDom(dom, this.resolver, this.getId());
            }
        }
    }

    private processBacklinkLayout(): void {
        if (this.isBacklinkWrapped) {
            return;
        }
        const view = this.facade.getViewsOfType<BacklinkViewExt>(Leaves.BL)[0] ?? null;
        if (view?.backlink?.backlinkDom) {
            this.mutateService.wrapDom(view.backlink.backlinkDom, this.resolver, this.getId());
        }
        if (view?.backlink?.unlinkedDom) {
            this.mutateService.wrapDom(view.backlink.unlinkedDom, this.resolver, this.getId());
        }
        this.isBacklinkWrapped = true;
    }
}
