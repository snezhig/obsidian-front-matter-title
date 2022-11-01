import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import AbstractManager from "@src/Feature/AbstractManager";
import { Manager } from "@src/enum";
import AliasManagerInterface from "@src/Feature/Alias/Interfaces/AliasManagerInterface";
import AliasManagerStrategyInterface from "@src/Feature/Alias/Interfaces/AliasManagerStrategyInterface";
import Alias from "@src/Feature/Alias/Alias";
import { MetadataCacheExt } from "obsidian";
import { MetadataCacheFactory } from "@config/inversify.factory.types";

@injectable()
export class AliasManager extends AbstractManager implements AliasManagerInterface {
    private enabled = false;
    private strategy: AliasManagerStrategyInterface = null;

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

    setStrategy(name: string) {
        this.strategy = this.strategyFactory(name);
    }

    doDisable(): void {
        this.enabled = false;
    }

    doEnable(): void {
        this.enabled = true;
    }

    private process(frontmatter: { [k: string]: any }, path: string): boolean {
        const alias = new Alias(frontmatter);
        this.strategy.process(alias, path);
        return alias.isChanged();
    }

    protected async doUpdate(path: string): Promise<boolean> {
        const cache = this.factory();
        const metadata = cache.getCache(path);
        return this.process(metadata?.frontmatter ?? {}, path);
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

    static getId(): Manager {
        return Manager.Alias;
    }

    getId(): Manager {
        return AliasManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
