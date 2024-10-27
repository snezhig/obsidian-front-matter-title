import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { injectable } from "inversify";

@injectable()
export default class Debugger implements LoggerInterface {
    constructor(private name: string, private enabled: () => boolean) {}

    info(...value: any[]): void {
        this.log(...value);
    }
    debug(...value: any[]): void {
        this.log(...value);
    }
    warn(...value: any[]): void {
        this.log(...value);
    }

    log(...value: any) {
        if (this.enabled()) {
            console.debug(`[${this.name}]`, ...value);
        }
    }
}
