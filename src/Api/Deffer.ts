import { Api, BindDeffer, BootDeffer, PluginBindIncompleteError } from "front-matter-plugin-api-provider";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";

export const DefferBound = 2;
export const DefferBooted = 4;
@injectable()
export default class Deffer implements BindDeffer, BootDeffer {
    private state = 0;

    private promises = {
        bind: null as Promise<Deffer>,
        boot: null as Promise<void>,
    };

    private resolves = {
        bind: null as (v?: unknown) => void,
        boot: null as (v?: unknown) => void,
    };

    constructor(
        @inject(SI["factory:api"])
        private factory: () => Api
    ) {
        this.promises.bind = new Promise(r => (this.resolves.bind = r));
        this.promises.boot = new Promise(r => (this.resolves.boot = r));
    }

    public setFlag(flag: typeof DefferBound | typeof DefferBooted) {
        if (!(this.state & flag)) {
            this.state = this.state | flag;
            this.processState();
        }
    }

    private processState(): void {
        if (this.isBound()) {
            this.resolves.bind(this);
            console.log(this.promises.bind);
            if (this.isBooted()) {
                this.resolves.boot();
            }
        }
    }

    async awaitBind(): Promise<BootDeffer> {
        console.log(this.promises.bind);
        return await this.promises.bind;
    }

    async awaitBoot(): Promise<void> {
        return this.promises.boot;
    }

    isBound(): boolean {
        return (this.state & DefferBound) !== 0;
    }

    isBooted(): boolean {
        return (this.state & DefferBooted) !== 0;
    }

    getApi(): Api {
        if (this.isBound()) {
            return this.factory();
        }
        throw new PluginBindIncompleteError("Not all services have been sound yet");
    }
}
