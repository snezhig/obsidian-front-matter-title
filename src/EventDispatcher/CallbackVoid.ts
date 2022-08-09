import CallbackInterface from "@src/EventDispatcher/Interfaces/CallbackInterface";
import EventInterface from "@src/EventDispatcher/Interfaces/EventInterface";

export default class CallbackVoid<T> implements CallbackInterface<T>{
    constructor(
        private cb: (e: EventInterface<T>) =>  void
    ) {
    }
    execute(e: EventInterface<T>): EventInterface<T> {
        this.cb(e);
        return e;
    }
}