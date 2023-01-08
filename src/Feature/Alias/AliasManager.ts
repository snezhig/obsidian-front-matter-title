import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import AbstractManager from "@src/Feature/AbstractManager";
import { Feature } from "@src/enum";
import Alias from "@src/Feature/Alias/Alias";
import { MetadataCacheExt } from "obsidian";
import { MetadataCacheFactory } from "@config/inversify.factory.types";
import { ValidateStrategyTypes } from "./Types";
import { AliasManagerStrategyInterface, ValidateStrategyInterface } from "./Interfaces";

@injectable()
export class AliasManager extends AbstractManager {
    private enabled = false;
    private strategy: AliasManagerStrategyInterface = null;
    private validateStrategy: ValidateStrategyInterface = null;
    private items: { [k: string]: Alias } = {};

    constructor(
        @inject(SI["factory:alias:modifier:strategy"])
        private strategyFactory: (name: string) => AliasManagerStrategyInterface,
        @inject(SI.logger)
        @named("alias:modifier")
        private logger: LoggerInterface,
        @inject(SI["factory:metadata:cache"])
        private factory: MetadataCacheFactory<MetadataCacheExt>
    ) {
        super();
    }

    public setValidateStategy(name: ValidateStrategyTypes): void {
        //todo: fill the body
    }

    public setStrategy(name: string): void {
        this.strategy = this.strategyFactory(name);
        this.reset();
        this.logger.log(`Set strategy [${name}]. Status: ${this.strategy !== null}`);
    }

    doDisable(): void {
        this.reset();
        this.enabled = false;
    }

    doEnable(): void {
        this.enabled = true;
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

    protected async doUpdate(path: string): Promise<boolean> {
        const cache = this.factory();
        const metadata = cache.getCache(path);
        return this.validateStrategy.validate(metadata) ? this.process(metadata.frontmatter, path) : false;
    }

    protected async doRefresh(): Promise<{ [p: string]: boolean }> {
        const cache = this.factory();
        const res: { [k: string]: boolean } = {};
        const promises = [];
        for (const path of cache.getCachedFiles()) {
            promises.push(this.doUpdate(path).then(r => (res[path] = r)));
        }
        await Promise.all(promises);
        return res;
    }

    static getId(): Feature {
        return Feature.Alias;
    }

    getId(): Feature {
        return AliasManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
