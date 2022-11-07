import {inject, injectable, named} from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import AbstractManager from "@src/Feature/AbstractManager";
import {Feature} from "@src/enum";
import AliasManagerStrategyInterface from "@src/Feature/Alias/Interfaces/AliasManagerStrategyInterface";
import Alias from "@src/Feature/Alias/Alias";
import {MetadataCacheExt} from "obsidian";
import {MetadataCacheFactory} from "@config/inversify.factory.types";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import {AppEvents} from "@src/Types";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";

@injectable()
export class AliasManager extends AbstractManager {
    private enabled = false;
    private strategy: AliasManagerStrategyInterface = null;
    private readonly callback: CallbackVoid<AppEvents['alias:strategy:changed']> = null;
    private items: { [k: string]: Alias } = {};

    constructor(
        @inject(SI["factory:alias:modifier:strategy"])
        private strategyFactory: (name: string) => AliasManagerStrategyInterface,
        @inject(SI.logger)
        @named("alias:modifier")
        private logger: LoggerInterface,
        @inject(SI["factory:metadata:cache"])
        private factory: MetadataCacheFactory<MetadataCacheExt>,
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>
    ) {
        super();
        this.callback = new CallbackVoid(e => this.setStrategy(e.get()));
    }

    public setStrategy(name: string) {
        this.strategy = this.strategyFactory(name);
        this.reset();
        this.logger.log(`Set strategy [${name}]. Status: ${this.strategy !== null}`);
    }

    doDisable(): void {
        this.dispatcher.removeListener('alias:strategy:changed', this.callback);
        this.enabled = false;
    }

    doEnable(): void {
        this.dispatcher.addListener('alias:strategy:changed', this.callback);
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
