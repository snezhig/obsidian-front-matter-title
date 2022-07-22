import DispatcherInterface from "./Interfaces/DispatcherInterface";
import EventInterface from "./Interfaces/EventInterface";
import CallbackInterface from "./Interfaces/CallbackInterface";
import {injectable} from "inversify";

@injectable()
export default class Dispatcher<E> implements DispatcherInterface<E> {
    private listeners: { [K in keyof E]?: CallbackInterface<E[K]>[] } = {};

    constructor() {
        console.log('created');
    }
    addListener<T extends keyof E>(name: T, cb: CallbackInterface<E[T]>): void {

        if (this.listeners[name] === undefined) {
            this.listeners[name] = [];
        }

        if(!this.listeners[name].includes(cb)){
            this.listeners[name].push(cb);
        }

    }

    dispatch<T extends keyof E>(name: T, e: EventInterface<E[T]>): EventInterface<E[T]> {
        const listeners = this.listeners[name] ?? [];

        for (const l of listeners) {
            e = l.execute(e);
        }

        return e;
    }
}