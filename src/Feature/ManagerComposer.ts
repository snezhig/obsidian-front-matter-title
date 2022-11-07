import FeatureComposer from "@src/Feature/FeatureComposer";
import { Feature } from "@src/enum";
import AbstractManager from "@src/Feature/AbstractManager";
import {inject, injectable, named} from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export default class ManagerComposer {
    private ids: Feature[] = Object.values(Feature);
    constructor(
        @inject(SI["feature:composer"])
        private features: FeatureComposer,
        @inject(SI.logger) @named('composer:manager')
        private logger: LoggerInterface
    ) {}

    public async update(path: string, id: Feature = null): Promise<{ [K in Feature]?: boolean }> {
        const ids = id ? [id] : this.ids;
        const result: { [K in Feature]?: boolean } = {};
        for (const i of ids) {
            const manager = this.features.get<AbstractManager>(i);
            if (manager) {
                this.logger.log(`Run update for [${path}] on [${manager.getId()}]`)
                result[i] = await manager.update(path);
            }
        }
        return result;
    }

    public async refresh(id: Feature = null): Promise<{ [K in Feature]?: { [k: string]: boolean } }> {
        this.logger.log('refresh');
        const ids = id ? [id] : this.ids;
        const result: { [K in Feature]?: { [k: string]: boolean } } = {};
        for (const i of ids) {
            const manager = this.features.get<AbstractManager>(i);
            if (manager) {
                result[i] = await manager.refresh();
            }
        }
        return result;
    }
}
