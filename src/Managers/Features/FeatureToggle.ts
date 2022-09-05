import {Feature} from "@src/enum";
import {inject, injectable, multiInject, named} from "inversify";
import SI from "@config/inversify.types";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export default class FeatureToggle {
    private features: { [K in Feature]?: FeatureInterface<Feature> } = {};

    constructor(
        @multiInject(SI.feature)
            features: FeatureInterface<Feature>[],
        @inject(SI.logger) @named('feature_toggle')
        private logger: LoggerInterface
    ) {
        for (const feature of features) {
            this.features[feature.getId()] = feature;
        }
        this.logger.log('Features', Object.keys(this.features));

    }

    async toggle(id: Feature, state: boolean): Promise<void> {
        const feature = this.features[id];
        feature && await feature[state ? 'enable' : 'disable']();
    }
    async toggleAll(state: boolean): Promise<void>{
        const promises = [];
        for(const feature of Object.values(this.features)){
            promises.push(feature[state ? 'enable': 'disable']());
        }
        await Promise.all(promises);
    }
}