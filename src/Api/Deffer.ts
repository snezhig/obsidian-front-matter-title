import { ApiInterface, DefferInterface, PluginIsNotReadyError } from "front-matter-plugin-api-provider";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";

export const DefferPluginReady = 2;
export const DefferManagersReady = 4;
@injectable()
export default class Deffer implements DefferInterface {
    private state = 0;

    private promises = {
        plugin: null as Promise<void>,
        managers: null as Promise<void>,
    };

    private resolves = {
        plugin: null as (v?: unknown) => void,
        managers: null as (v?: unknown) => void,
    };

    constructor(
        @inject(SI["factory:api"])
        private factory: () => ApiInterface
    ) {
        this.promises.plugin = new Promise(r => (this.resolves.plugin = r));
        this.promises.managers = new Promise(r => (this.resolves.managers = r));
    }

    public setFlag(flag: typeof DefferPluginReady | typeof DefferManagersReady) {
        if (!(this.state & flag)) {
            this.state = this.state | flag;
            this.processState();
        }
    }

    private processState(): void {
        if (this.isPluginReady()) {
            this.resolves.plugin();
            if (this.isManagersReady()) {
                this.resolves.managers();
            }
        }
    }

    async awaitPlugin(): Promise<void> {
        return await this.promises.plugin;
    }

    async awaitManagers(): Promise<void> {
        return this.promises.managers;
    }

    isPluginReady(): boolean {
        return (this.state & DefferPluginReady) !== 0;
    }

    isManagersReady(): boolean {
        return (this.state & DefferManagersReady) !== 0;
    }

    getApi(): ApiInterface {
        if (this.isPluginReady()) {
            return this.factory();
        }
        throw new PluginIsNotReadyError("Not all services have been sound yet");
    }
}
