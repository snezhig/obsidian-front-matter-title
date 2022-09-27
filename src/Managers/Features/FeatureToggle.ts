import { Feature } from "@src/enum";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export default class FeatureToggle {
    private features: { [K in Feature]?: FeatureInterface<Feature> } = {};

    constructor(
        @inject(SI["factory:feature"])
        private factory: (id: Feature) => FeatureInterface<Feature>,
        @inject(SI.logger)
        @named("feature_toggle")
        private logger: LoggerInterface
    ) {}

    async toggle(id: Feature, state: boolean): Promise<void> {
        const feature = this.features[id];
        if (!state && !feature) {
            return;
        }
        if (!feature) {
            this.features[id] = this.factory(id);
            return this.toggle(id, state);
        }
        await feature[state ? "enable" : "disable"]();
        if (!state) {
            delete this.features[id];
        }
    }
    async disableAll(): Promise<void> {
        const promises = [];
        for (const feature of Object.values(this.features)) {
            promises.push(feature.disable());
        }
        await Promise.all(promises);
        this.features = {};
    }
}
