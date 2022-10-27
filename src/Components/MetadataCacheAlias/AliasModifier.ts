import FeatureInterface from "@src/Interfaces/FeatureInterface";
import {inject, injectable, named} from "inversify";
import SI from "@config/inversify.types";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import {AppEvents} from "@src/Types";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";
import {SettingsEvent} from "@src/Settings/SettingsType";
import AliasModifierStrategyInterface
    from "@src/Components/MetadataCacheAlias/Interfaces/AliasModifierStrategyInterface";
import AliasModifierInterfaceInterface
    from "@src/Components/MetadataCacheAlias/Interfaces/AliasModifierInterfaceInterface";
import Alias from "@src/Components/MetadataCacheAlias/Alias";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export class AliasModifier implements FeatureInterface<string>, AliasModifierInterfaceInterface {

    private enabled = false;
    private callback: CallbackInterface<AppEvents['metadata:cache:changed']> = null;
    private strategy: AliasModifierStrategyInterface = null;

    constructor(
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents & SettingsEvent>,
        @inject(SI["factory:alias:modifier:strategy"])
        private strategyFactory: (name: string) => AliasModifierStrategyInterface,
        @inject(SI.logger) @named("alias:modifier")
        private logger: LoggerInterface
    ) {
        this.init();
    }

    private init() {
        this.callback = new CallbackVoid(e => {
            const {file: {path}, cache} = e.get();
            this.strategy.process(new Alias(cache.frontmatter ?? {}), path);
        })
    }

    setStrategy(name: string) {
        this.strategy = this.strategyFactory(name);
    }

    disable(): void {
        this.dispatcher.removeListener('metadata:cache:changed', this.callback);
        this.enabled = false;
    }

    enable(): void {
        if (!this.enabled) {
            this.dispatcher.addListener('metadata:cache:changed', this.callback);
            this.enabled = true;
        }
    }

    getId(): string {
        return 'alias-modify';
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}