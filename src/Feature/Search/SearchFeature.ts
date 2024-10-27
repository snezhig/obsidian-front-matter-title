import { inject, named } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature, Leaves, Plugins } from "@src/Enum";
import { SearchDOM, SearchPluginView, WorkspaceLeafExt } from "obsidian";
import SearchDomWrapperService from "../../Utils/SearchDomWrapperService";
import AbstractFeature from "../AbstractFeature";
import FeatureService from "../FeatureService";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import { State } from "@src/Feature/Search/Types";

export default class SearchManager extends AbstractFeature<Feature> {
    private state: State = State.Disabled;
    private dom: SearchDOM = null;
    private resolver: ResolverInterface;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.logger)
        @named("manager:search")
        private logger: LoggerInterface,
        @inject(SI["service:search:dom:wrapper"])
        private service: SearchDomWrapperService,
        @inject(SI["feature:service"])
        featureService: FeatureService,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>
    ) {
        super();
        this.resolver = featureService.createResolver(this.getId());
    }

    static getId(): Feature {
        return Feature.Search;
    }

    public disable(): void {
        this.dom = null;
        this.service.destroyByTag(this.getId());
        this.setState(State.Disabled);
    }

    public enable(): void {
        if (!this.facade.isInternalPluginEnabled(Plugins.Search)) {
            this.logger.info(`internal plugin ${Plugins.Search} is not enabled`);
            return;
        }
        if (this.isLeafActive()) {
            this.tryEnable();
        } else {
            this.waitForLeafActivation();
        }
    }

    private setState(state: State): void {
        this.logger.info(`Change state from ${this.state} to ${state}`);
        this.state = state;
    }
    private tryEnable(): void {
        const dom = this.getSearchDom();
        if (!dom) {
            throw new Error(`View of ${Leaves.S} not found`);
        }
        this.service.wrapDom(dom, this.resolver, this.getId());
        this.setState(State.Enabled);
    }

    private waitForLeafActivation(): void {
        const ref = this.dispatcher.addListener({
            name: "active:leaf:change",
            cb: () => {
                this.logger.debug("called active:leaf:change callback");
                if (!this.isEnabled()) {
                    this.dispatcher.removeListener(ref);
                } else if (this.isLeafActive()) {
                    this.dispatcher.removeListener(ref);
                    this.tryEnable();
                }
            },
        });
        this.setState(State.WaitForActiveLeaf);
    }

    getId(): Feature {
        return SearchManager.getId();
    }

    isEnabled(): boolean {
        return this.state !== State.Disabled;
    }

    private isLeafActive(): boolean {
        return this.facade.getLeavesOfType<WorkspaceLeafExt>(Leaves.S)?.[0]?.isVisible();
    }

    private getView(): SearchPluginView | null {
        return this.facade.getViewsOfType<SearchPluginView>(Leaves.S)?.[0] ?? null;
    }

    private getSearchDom(): SearchDOM | null {
        if (!this.dom) {
            this.dom = this.getView()?.dom ?? null;
        }
        return this.dom;
    }
}
