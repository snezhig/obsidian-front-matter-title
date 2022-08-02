import CallbackInterface from "@src/EventDispatcher/Interfaces/CallbackInterface";
import EventInterface from "@src/EventDispatcher/Interfaces/EventInterface";

export default class Callback<T> implements CallbackInterface<T> {
    constructor(
        private cb: (e: EventInterface<T>) => EventInterface<T>
    ) {
    }

    execute(e: EventInterface<T>): EventInterface<T> {
        return this.cb(e);
    }

}