import FeatureComposer from "@src/Feature/FeatureComposer";
import {Manager} from "@src/enum";
import AbstractManager from "@src/Feature/AbstractManager";
import {inject, injectable} from "inversify";
import SI from "@config/inversify.types";

@injectable()
export default class ManagerComposer {
    private ids: Manager[] = Object.values(Manager);
    constructor(
        @inject(SI["feature:composer"])
        private features: FeatureComposer,
    ) {
    }

    public async update(path: string, id: Manager = null): Promise<{ [K in Manager]?: boolean }> {
        const ids = id ? [id] : this.ids;
        const result: { [K in Manager]?: boolean } = {};
        for (const i of ids) {
            const manager = this.features.get<AbstractManager>(i);
            if (manager) {
                result[i] = await manager.update(path);
            }
        }
        return result;
    }

    public async refresh(id: Manager = null): Promise<{ [K in Manager]?: { [k: string]: boolean } }> {
        const ids = id ? [id] : this.ids;
        const result: { [K in Manager]?: { [k: string]: boolean } } = {};
        for (const i of ids) {
            const manager = this.features.get<AbstractManager>(i);
            if (manager) {
                result[i] = await manager.refresh();
            }
        }
        return result;
    }
}