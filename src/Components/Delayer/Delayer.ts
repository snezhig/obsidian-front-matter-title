import { injectable } from "inversify";

export interface DelayerInterface {
    delay(fn: Function, time: number): number;

    clear(id: number): void;
}

@injectable()
export class Delayer implements DelayerInterface {
    delay(fn: Function, time: number): number {
        return window.setTimeout(fn, time);
    }

    clear(id: number): void {
        window.clearTimeout(id);
    }
}
