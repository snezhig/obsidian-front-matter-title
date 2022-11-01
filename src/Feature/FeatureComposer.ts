import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";

@injectable()
export default class FeatureComposer {
    private features: { [k: string]: FeatureInterface<any> } = {};

    constructor(
        @inject(SI["factory:feature"])
        private factory: (name: string) => FeatureInterface<any>
    ) {}

    public get<K extends FeatureInterface<any>>(id: any): K | null {
        return (this.features[id] as K) ?? null;
    }

    toggle(id: any, state: boolean): void {
        const feature = this.features[id];
        if (!state && !feature) {
            return;
        }
        if (!feature) {
            this.features[id] = this.factory(id);
            return this.toggle(id, state);
        }
        feature[state ? "enable" : "disable"]();
        if (!state) {
            delete this.features[id];
        }
    }

    async disableAll(): Promise<void> {
        for (const feature of Object.values(this.features)) {
            feature.disable();
        }
        this.features = {};
    }
}
