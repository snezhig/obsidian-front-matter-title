import {EventEnum} from "./EventEnum";
import DispatcherInterface from "./Interfaces/DispatcherInterface";
import EventInterface from "./Interfaces/EventInterface";

export default class Dispatcher implements DispatcherInterface {
    addListener<T extends keyof EventEnum>(name: T, cb: (e: EventInterface<EventEnum[T]>) => EventInterface<EventEnum[T]>): void {
    }

    dispatch<T extends keyof EventEnum>(name: T, e: EventInterface<EventEnum[T]>): EventInterface<EventEnum[T]> {
        return undefined;
    }
}