import LoggerInterface from "@src/Components/Logger/LoggerInterface";
import Logger from "@src/Components/Logger/Logger";
import debug from "debug";
import {injectable} from "inversify";

@injectable()
export default class LoggerComposer {
    private loggers = new Map<string, LoggerInterface>();
    private initState = false;

    public create(name: string): LoggerInterface {
        if (!this.loggers.has(name)) {
            this.loggers.set(name, new Logger(debug(name)));
            this[this.initState ? 'enable' : 'disable']();
        }
        return this.loggers.get(name);
    }

    public enable(): void {
        for (const l of this.loggers.keys()) {
            debug.enable(l);
        }
    }


    public disable(): void {
        debug.disable();
    }
    public setInitialState(state: boolean): LoggerComposer{
        this.initState = state;
        return this;
    }
}