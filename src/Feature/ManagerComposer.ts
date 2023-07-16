import FeatureComposer from "@src/Feature/FeatureComposer";
import { Feature, Managers } from "@src/Enum";
import AbstractManager from "@src/Feature/AbstractManager";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { AppEvents } from "@src/Types";
import Event from "@src/Components/EventDispatcher/Event";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

@injectable()
export default class ManagerComposer {
    private ids: Feature[] = Managers;

    constructor(
        @inject(SI["feature:composer"])
        private features: FeatureComposer,
        @inject(SI.logger)
        @named("composer:manager")
        private logger: LoggerInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>
    ) {}

    public async update(path: string, id: Feature = null): Promise<{ [K in Feature]?: boolean }> {
        const ids = id ? [id] : this.ids;
        const result: { [K in Feature]?: boolean } = {};
        const promises = [];
        for (const i of ids) {
            const manager = this.features.get<AbstractManager>(i);
            if (manager) {
                this.logger.log(`Run update for [${path}] on [${manager.getId()}]`);
                promises.push(
                    manager.update(path).then(r => {
                        result[i] = r;
                        this.dispatcher.dispatch("manager:update", new Event({ id: i, result: r, path }));
                    })
                );
            }
        }
        await Promise.all(promises);
        return result;
    }

    public async refresh(id: Feature = null): Promise<void> {
        this.logger.log("refresh");
        const ids = id ? [id] : this.ids;
        const promises = [];
        for (const i of ids) {
            const manager = this.features.get<AbstractManager>(i);
            if (manager) {
                promises.push(
                    manager.refresh().then(() => this.dispatcher.dispatch("manager:refresh", new Event({ id: i })))
                );
            }
        }
        await Promise.all(promises);
    }
}
