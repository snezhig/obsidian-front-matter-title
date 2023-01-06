import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import { AppEvents } from "@src/Types";
import Event from "@src/Components/EventDispatcher/Event";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

@injectable()
export default class FeatureComposer {
    private features: { [k: string]: FeatureInterface<any> } = {};

    constructor(
        @inject(SI["factory:feature"])
        private factory: (name: string) => FeatureInterface<any>,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI.logger)
        @named("composer:feature")
        private logger: LoggerInterface
    ) {}

    public get<K extends FeatureInterface<any>>(id: any): K | null {
        return (this.features[id] as K) ?? null;
    }

    toggle(id: any, state: boolean): void {
        const feature = this.features[id];
        if ((!state && !feature) || (state && feature?.isEnabled())) {
            return;
        }

        if (!feature) {
            this.features[id] = this.factory(id);
            return this.toggle(id, state);
        }

        feature[state ? "enable" : "disable"]();
        this.logger.log(`Feature - ${feature.getId()}. State: ${state}`);
        if (!state) {
            delete this.features[id];
        } else {
            this.dispatcher.dispatch("feature:enable", new Event({ feature }));
        }
    }

    disableAll(): void {
        for (const feature of Object.values(this.features)) {
            this.logger.log(`Disable feature ${feature.getId()}`);
            feature.disable();
        }
        this.features = {};
    }
}
