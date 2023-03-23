import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature } from "@src/enum";
import Alias from "@src/Feature/Alias/Alias";
import { CachedMetadata, MetadataCacheExt } from "obsidian";
import { MetadataCacheFactory } from "@config/inversify.factory.types";
import { StrategyFactory, StrategyType, ValidatorFactory, ValidatorType } from "./Types";
import { StrategyInterface, ValidatorInterface } from "./Interfaces";
import AbstractFeature from "@src/Feature/AbstractFeature";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import AliasConfig from "@src/Feature/Alias/AliasConfig";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";

@injectable()
export class AliasFeature extends AbstractFeature<Feature> {
    private enabled = false;
    private strategy: StrategyInterface = null;
    private validator: ValidatorInterface = null;
    private items: { [k: string]: Alias } = {};
    private ref: ListenerRef<"metadata:cache:changed"> = null;

    constructor(
        @inject(SI["factory:alias:modifier:strategy"])
        private strategyFactory: StrategyFactory,
        @inject(SI["factory:alias:modifier:validator"])
        private validatorFactory: ValidatorFactory,
        @inject(SI.logger)
        @named("alias:modifier")
        private logger: LoggerInterface,
        @inject(SI["factory:metadata:cache"])
        private factory: MetadataCacheFactory<MetadataCacheExt>,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["feature:alias:config"])
        private config: AliasConfig
    ) {
        super();
    }

    private setValidator(type: ValidatorType): void {
        this.validator = this.validatorFactory(type);
        this.logger.log(`Set validator [${type}]. Status: ${this.validator !== null}`);
    }

    private setStrategy(type: StrategyType): void {
        this.strategy = this.strategyFactory(type);
        this.logger.log(`Set strategy [${type}]. Status: ${this.strategy !== null}`);
    }

    disable(): void {
        this.reset();
        this.dispatcher.removeListener(this.ref);
        this.ref = null;
        this.enabled = false;
    }

    enable(): void {
        this.ref = this.dispatcher.addListener({
            name: "metadata:cache:changed",
            cb: e => this.update(e.get().path, e.get().cache),
        });
        this.setValidator(this.config.getValidator());
        this.setStrategy(this.config.getStrategy());
        this.enabled = true;
        this.refresh().catch(console.error);
    }

    private process(frontmatter: { [k: string]: any }, path: string): boolean {
        const alias = new Alias(frontmatter);
        this.strategy.process(alias, path);
        const result = alias.isChanged();
        if (result) {
            this.items[path] = alias;
        }
        return result;
    }

    private reset(): void {
        for (const alias of Object.values(this.items)) {
            alias.restore();
        }
        this.items = {};
    }

    private async update(path: string, metadata: CachedMetadata = null): Promise<void> {
        if (this.validator.validate(metadata)) {
            this.process(metadata.frontmatter, path);
        }
    }

    private async refresh(): Promise<void> {
        const cache = this.factory();
        const promises = [];
        for (const path of cache.getCachedFiles()) {
            promises.push(this.update(path, cache.getCache(path)));
        }
        await Promise.all(promises);
    }

    static getId(): Feature {
        return Feature.Alias;
    }

    getId(): Feature {
        return AliasFeature.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
