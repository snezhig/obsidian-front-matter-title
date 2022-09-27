import EventInterface from "./EventInterface";

export default interface CallbackInterface<T> {
    execute(e: EventInterface<T>): EventInterface<T>;
}
