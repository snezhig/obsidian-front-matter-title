import ManagerInterface from "@src/Interfaces/ManagerInterface";
import {inject, injectable, multiInject, named} from "inversify";
import SI from "@config/inversify.types";
import {Manager} from "@src/enum";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export default class Composer {
    private managers: { [K in Manager]?: ManagerInterface } = {};

    constructor(
        @multiInject(SI.manager)
            managers: ManagerInterface[],
        @inject(SI.logger) @named('composer')
        private logger: LoggerInterface
    ) {
        for (const item of managers) {
            this.managers[item.getId()] = item;
        }
    }

    public async update(path: string|null = null, id: Manager = null): Promise<void> {
        await this.do(e => e.update(path), id);
    }

    public async setState(state: boolean, id: Manager = null): Promise<void> {
        await this.do(e => e[state ? 'enable' : 'disable'](), id);
    }

    private async do(e: (manager: ManagerInterface) => Promise<any>, id: Manager = null): Promise<void> {
        const promises = [];
        for (const manager of this.determineItems(id)) {
            promises.push(e(manager));
        }
        await Promise.all(promises);
    }

    private determineItems(id: Manager = null): ManagerInterface[] {
        if (id && !this.managers[id]) {
            this.logger.log(`There is not manager with id ${id}`)
            return [];
        }
        return id ? [this.managers[id]] : Object.values(this.managers);
    }
}