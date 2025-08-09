import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature } from "@src/Enum";
import { CachedMetadata, MetadataCacheExt } from "obsidian";
import { MetadataCacheFactory } from "@config/inversify.factory.types";
import AbstractFeature from "@src/Feature/AbstractFeature";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import Alias from "@src/Feature/Alias/Alias";
import FeatureService from "@src/Feature/FeatureService";
import { ResolverInterface } from "@src/Resolver/Interfaces";

@injectable()
export default class AbbreviationsFeature extends AbstractFeature<Feature> {
    private enabled = false;
    private ref: ListenerRef<"metadata:cache:changed"> = null;
    private resolver: ResolverInterface;

    constructor(
        @inject(SI.logger)
        @named("abbreviations")
        private logger: LoggerInterface,
        @inject(SI["factory:metadata:cache"]) private factory: MetadataCacheFactory<MetadataCacheExt>,
        @inject(SI["event:dispatcher"]) private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["feature:config"]) @named(Feature.Abbreviations) private config: { key?: string },
        @inject(SI["feature:service"]) private featureService: FeatureService
    ) {
        super();
        this.resolver = this.featureService.createResolver(Feature.Abbreviations);
    }

    static getId(): Feature {
        return Feature.Abbreviations;
    }

    disable(): void {
        this.dispatcher.removeListener(this.ref);
        this.ref = null;
        this.enabled = false;
    }

    enable(): void {
        // Only enable when Alias feature is active (enforced in main reloadFeatures)
        this.ref = this.dispatcher.addListener({
            name: "metadata:cache:changed",
            cb: e => this.update(e.get().path, e.get().cache),
        });
        this.enabled = true;
        this.refresh().catch(console.error);
    }

    getId(): Feature {
        return AbbreviationsFeature.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    private process(frontmatter: { [k: string]: any }, path: string): boolean {
        // debug: process frontmatter keys
        const alias = new Alias(frontmatter);
        // Resolve abbreviation via templates (main/fallback)
        const value = this.resolver.resolve(path);
        if (!value) return false;
        let current = alias.getValue() ?? [];
        if (!Array.isArray(current)) current = [current];
        const values: string[] = Array.isArray(value) ? value : [value];
        for (const v of values) {
            if (!current.includes(v)) {
                current.push(v);
            }
        }
        alias.setValue(current);
        // debug: aliases after
        return alias.isChanged();
    }

    private async update(path: string, metadata: CachedMetadata = null): Promise<void> {
        if (!metadata?.frontmatter) {
            // debug: skip: no frontmatter
            return;
        }
        // debug: update path
        const changed = this.process(metadata.frontmatter, path);
        if (changed) {
            this.logger.log(`Abbreviations updated for ${path}`);
            // debug: updated for path
        }
    }

    private async refresh(): Promise<void> {
        const cache = this.factory();
        const promises = [] as Promise<void>[];
        for (const path of cache.getCachedFiles()) {
            promises.push(this.update(path, cache.getCache(path)));
        }
        await Promise.all(promises);
    }
}
