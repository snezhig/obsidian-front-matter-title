import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { inject, injectable } from "inversify";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import FeatureComposer from "@src/Feature/FeatureComposer";
import SI from "@config/inversify.types";
import Storage from "@src/Settings/Storage";
import { SettingsType } from "@src/Settings/SettingsType";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";
import { Feature } from "@src/enum";
import { AliasManager } from "@src/Feature/Alias/AliasManager";
import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";

@injectable()
export default class Listener implements ListenerInterface {
    private readonly stateCallback: CallbackInterface<AppEvents["feature:state:changed"]>;
    private readonly changeCallback: CallbackInterface<AppEvents["alias:strategy:changed"]>;
    private lastStrategy: string = null;

    constructor(
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>,
        @inject(SI["feature:composer"])
        private composer: FeatureComposer,
        @inject(SI.storage)
        private storage: Storage<SettingsType>
    ) {
        this.stateCallback = new CallbackVoid(this.onStateChange.bind(this));
        this.changeCallback = new CallbackVoid(e => this.setStrategy(e.get()));
    }

    private onStateChange(event: EventInterface<AppEvents["feature:state:changed"]>): void {
        const { id, enabled } = event.get();
        if (id !== Feature.Alias) {
            return;
        }
        if (enabled) {
            const strategy = this.storage.get("features").get(Feature.Alias).get("strategy").value();
            this.setStrategy(strategy);
        } else {
            this.lastStrategy = null;
        }
    }

    private setStrategy(strategy: string): void {
        if (this.lastStrategy !== strategy) {
            const alias = this.composer.get(Feature.Alias) as AliasManager;
            if (alias) {
                alias.setStrategy(strategy);
                this.lastStrategy = strategy;
            }
        }
    }

    bind(): void {
        this.dispatcher.addListener("feature:state:changed", this.stateCallback);
        this.dispatcher.addListener("alias:strategy:changed", this.changeCallback);
    }

    unbind(): void {
        this.dispatcher.removeListener("feature:state:changed", this.stateCallback);
        this.dispatcher.removeListener("alias:strategy:changed", this.changeCallback);
    }
}
