import DispatcherInterface from "./Interfaces/DispatcherInterface";
import EventInterface from "./Interfaces/EventInterface";
import CallbackInterface from "./Interfaces/CallbackInterface";
import {inject, injectable, named} from "inversify";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export default class Dispatcher<E> implements DispatcherInterface<E> {
    private listeners: { [K in keyof E]?: CallbackInterface<E[K]>[] } = {};

    constructor(
        @inject(SI.logger) @named('dispatcher')
        private logger: LoggerInterface
    ) {
    }

    addListener<T extends keyof E>(name: T, cb: CallbackInterface<E[T]>): void {
        if (this.listeners[name] === undefined) {
            this.listeners[name] = [];
        }

        if (!this.listeners[name].includes(cb)) {
            this.listeners[name].push(cb);
        }
        console.log(this.listeners[name], name);
    }

    removeListener<T extends  keyof E>(name: T, cb: CallbackInterface<any>): void{
       this.listeners[name] = this.listeners[name].filter(e => cb !== e);
        console.log(this.listeners[name], name, 'removeListener');
    }

    dispatch<T extends keyof E>(name: T, e: EventInterface<E[T]>): EventInterface<E[T]> {
        this.logger.log(`Dispatch ${name}`)
        const listeners = this.listeners[name] ?? [];
        for (const l of listeners) {
            e = l.execute(e);
        }
        return e;
    }
}