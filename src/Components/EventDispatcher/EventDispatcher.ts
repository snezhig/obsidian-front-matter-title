import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";
import EventDispatcherInterface, {
    Callback,
    Listener,
} from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

export class EventDispatcher<E> implements EventDispatcherInterface<E> {
    private readonly events: Map<
        keyof E,
        { cb: Callback<E[keyof E]>; sort: number; once: boolean; ref: ListenerRef<keyof E> }[]
    > = new Map();

    addListener<T extends keyof E>({ name, cb, sort = null, once = false }: Listener<E, T>): ListenerRef<T> {
        const ref: ListenerRef<T> = { getName: () => name };
        const events = this.events.get(name) ?? [];
        sort = sort ?? (events[0]?.sort ?? 0) + 1;
        events.push({ cb, sort, ref, once });
        events.sort((a, b) => a.sort - b.sort);
        this.events.set(name, events);
        return ref;
    }

    dispatch<T extends keyof E>(name: T, e: E[T] extends undefined | null ? undefined : EventInterface<E[T]>) {
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
