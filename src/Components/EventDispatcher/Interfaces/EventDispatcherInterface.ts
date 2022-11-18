import EventInterface from "./EventInterface";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";

type Callback<T> = (e: T extends undefined | null ? undefined : EventInterface<T>) => void;

export default interface EventDispatcherInterface<E> {
    addListener<T extends keyof E>(listener: {
        name: T;
        cb: Callback<E[T]>;
        sort: number;
        once: boolean;
    }): ListenerRef<T>;

    removeListener<T extends keyof E>(ref: ListenerRef<T>): void;

    dispatch<T extends keyof E>(name: T, e: E[T] extends undefined | null ? null : EventInterface<E[T]>): void;
}

export class EventDispatcher<E> implements EventDispatcherInterface<E> {
    private readonly events: Map<
        keyof E,
        { cb: Callback<E[keyof E]>; sort: number; once: boolean; ref: ListenerRef<keyof E> }[]
    > = new Map();

    addListener<T extends keyof E>({
        name,
        cb,
        sort = 100,
        once = false,
    }: {
        name: T;
        cb: Callback<E[T]>;
        sort?: number;
        once?: boolean;
    }): ListenerRef<T> {
        const ref: ListenerRef<T> = { getName: () => name };
        this.events.set(name, []);
        this.events.get(name).push({ cb, sort, ref, once });
        return undefined;
    }

    dispatch<T extends keyof E>(name: T, e: E[T] extends undefined | null ? null : EventInterface<E[T]>): void {
        for (const [i, item] of this.events.get(name).entries()) {
            item.cb(e);
            if (item.once) {
                this.events.get(name).splice(i, 1);
            }
        }
    }

    removeListener<T extends keyof E>(ref: ListenerRef<T>): void {
        for (const [i, item] of this.events.get(ref.getName()).entries()) {
            if (item.ref === ref) {
                this.events.get(ref.getName()).splice(i, 1);
                return;
            }
        }
    }
}
