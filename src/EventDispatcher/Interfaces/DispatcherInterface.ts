import {EventEnum} from "../EventEnum";
import EventInterface from "./EventInterface";
import CallbackInterface from "./CallbackInterface";

export default interface DispatcherInterface<E> {
    addListener<T extends keyof E>(name: T, cb: CallbackInterface<E[T]>): void

    dispatch<T extends keyof E>(name: T, e: EventInterface<E[T]>): EventInterface<E[T]>
}