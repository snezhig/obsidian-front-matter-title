import EventInterface from "./EventInterface";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";

export type Callback<T> = (e: T extends undefined | null ? undefined : EventInterface<T>) => void;
export type Listener<E, T extends keyof E> = {
    name: T;
    cb: Callback<E[T]>;
    sort?: number;
    once?: boolean;
};
export default interface EventDispatcherInterface<E> {
    addListener<T extends keyof E>(listener: Listener<E, T>): ListenerRef<T>;

    removeListener<T extends keyof E>(ref: ListenerRef<T>): void;

    dispatch<T extends keyof E>(name: T, e: E[T] extends undefined | null ? undefined : EventInterface<E[T]>): void;
}
