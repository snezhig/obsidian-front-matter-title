import { injectable } from "inversify";

export interface DelayerInterface {
    delay(fn: Function, time: number): number;

    clear(id: number): void;
}

@injectable()
export class Delayer implements DelayerInterface {
    delay(fn: Function, time: number): number {
        return setTimeout(fn, time);
    }

    clear(id: number): void {
        clearTimeout(id);
    }
}
