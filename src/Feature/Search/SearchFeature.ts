import { inject, named } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature, Leaves } from "@src/Enum";
import { SearchPluginView, SearchDOM } from "obsidian";
import SearchDomWrapperService from "../../Utils/SearchDomWrapperService";
import AbstractFeature from "../AbstractFeature";
import FeatureService from "../FeatureService";
import { ResolverInterface } from "../../Resolver/Interfaces";

export default class SearchManager extends AbstractFeature<Feature> {
    private enabled = false;
    private dom: SearchDOM = null;
    private resolver: ResolverInterface;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.logger)
        @named("manager:starred")
        private logger: LoggerInterface,
        @inject(SI["service:search:dom:wrapper"])
        private service: SearchDomWrapperService,
        @inject(SI["feature:service"])
        featureService: FeatureService
    ) {
        super();
        this.resolver = featureService.createResolver(this.getId());
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

    public disable(): void {
        this.dom = null;
        this.service.destroyByTag(this.getId());
        this.enabled = false;
    }

    public enable(): void {
        const dom = this.getSearchDom();
        if (!dom) {
            throw new Error(`View of ${Leaves.S} not found`);
        }
        this.service.wrapDom(dom, this.resolver, this.getId());
        this.enabled = true;
    }

    static getId(): Feature {
        return Feature.Search;
    }
    getId(): Feature {
        return SearchManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
