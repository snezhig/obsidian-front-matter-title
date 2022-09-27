import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import Debugger from "@src/Components/Debug/Debugger";
import { injectable } from "inversify";

@injectable()
export default class LoggerComposer {
    private loggers = new Map<string, LoggerInterface>();
    private enabled = false;

    public create(name: string): LoggerInterface {
        if (!this.loggers.has(name)) {
            this.loggers.set(name, new Debugger(name, this.isEnabled.bind(this)));
        }
        return this.loggers.get(name);
    }

    private isEnabled() {
        return this.enabled;
    }

    public enable(): void {
        this.enabled = true;
    }

    public disable(): void {
        this.enabled = false;
    }
}
