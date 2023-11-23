export interface DelayerInterface {
    delay(fn: Function, time: number): number;

    clear(id: number): void;
}

export class Delayer implements DelayerInterface {
    delay(fn: Function, time: number): number {
        return setTimeout(fn, time);
    }

    clear(id: number) {
        clearTimeout(id);
    }
}
