import { ApiInterface, DeferInterface } from "front-matter-plugin-api-provider";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";

export const DeferPluginReady = 2;
export const DeferFeaturesReady = 4;
@injectable()
export default class Defer implements DeferInterface {
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

    public setFlag(flag: typeof DeferPluginReady | typeof DeferFeaturesReady) {
        if (!(this.state & flag)) {
            this.state = this.state | flag;
            this.processState();
        }
    }

    private processState(): void {
        if (this.isPluginReady()) {
            this.resolves.plugin();
            if (this.isFeaturesReady()) {
                this.resolves.managers();
            }
        }
    }

    async awaitPlugin(): Promise<void> {
        return await this.promises.plugin;
    }

    async awaitFeatures(): Promise<void> {
        return this.promises.managers;
    }

    isPluginReady(): boolean {
        return (this.state & DeferPluginReady) !== 0;
    }

    isFeaturesReady(): boolean {
        return (this.state & DeferFeaturesReady) !== 0;
    }

    getApi(): ApiInterface | null {
        return this.isPluginReady() ? this.factory() : null;
    }
}
