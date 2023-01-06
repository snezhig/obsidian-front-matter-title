import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { inject, injectable } from "inversify";
import { AppEvents } from "@src/Types";
import SI from "@config/inversify.types";
import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import { AliasManager } from "@src/Feature/Alias/AliasManager";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import FeatureInterface from "@src/Interfaces/FeatureInterface";

@injectable()
export default class Listener implements ListenerInterface {
    private refs: [ListenerRef<"feature:enable">?, ListenerRef<"settings:changed">?] = [];
    private lastStrategy: string = null;

    constructor(
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents & SettingsEvent>
    ) {}

    private handleEnable(feature: FeatureInterface<any>): void {
        if (feature instanceof AliasManager && this.lastStrategy) {
            feature.setStrategy(this.lastStrategy);
        }
    }

    private handleSettings(settings: SettingsType): void {
        this.lastStrategy = settings.features.alias.strategy;
    }

    bind(): void {
        this.refs.push(
            this.dispatcher.addListener({
                name: "feature:enable",
                cb: e => this.handleEnable(e.get().feature),
            })
        );
        this.refs.push(
            this.dispatcher.addListener({
                name: "settings:changed",
                cb: e => this.handleSettings(e.get().actual),
            })
        );
        this.dispatcher.addListener({
            name: "settings.loaded",
            once: true,
            cb: e => this.handleSettings(e.get().settings),
        });
    }

    unbind(): void {
        this.refs.forEach(e => this.dispatcher.removeListener(e));
        this.refs = [];
    }
}
