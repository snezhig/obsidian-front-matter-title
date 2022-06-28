import {EventEnum} from "../EventEnum";
import EventInterface from "./EventInterface";

export default interface DispatcherInterface {
    addListener<T extends keyof EventEnum>(name: T, cb: (e: EventInterface<EventEnum[T]>) => EventInterface<EventEnum[T]>): void
    dispatch<T extends keyof EventEnum>(name: T, e: EventInterface<EventEnum[T]>): EventInterface<EventEnum[T]>
}