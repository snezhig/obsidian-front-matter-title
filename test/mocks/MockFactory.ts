import { mock } from "jest-mock-extended";
import EventDispatcherInterface, {
    Callback,
} from "../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import ListenerRef from "../../src/Components/EventDispatcher/Interfaces/ListenerRef";

export const createEventDispatcherMock = <E>() => {
    const m = mock<EventDispatcherInterface<E>>();
    const callbacks: { [K in keyof E]?: { cb: Callback<E[keyof E]>; ref: ListenerRef<keyof E> } } = {};
    m.addListener.mockImplementation(l => {
        callbacks[l.name] = { cb: l.cb, ref: { getName: () => l.name } };
        return callbacks[l.name].ref;
    });
    return { mockEventDispatcher: m, callbacks };
};
