import { mock } from "jest-mock-extended";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";
import Dispatcher from "@src/Components/EventDispatcher/Dispatcher";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

type Events = {
    test: { value: string };
    number_test: number;
};
type DataItem<T extends keyof Events> = {
    event: Events[T];
    implementations: ((e: EventInterface<Events[T]>) => EventInterface<Events[T]>)[];
    expected: Events[T];
};
const data: { [T in keyof Events]?: DataItem<T> } = {
    test: {
        event: { value: "empty" },
        implementations: [
            e => e,
            e => mock<EventInterface<Events["test"]>>({ get: () => ({ value: e.get().value + "-10" }) }),
        ],
        expected: { value: "empty-10" },
    },
    number_test: {
        event: 25,
        implementations: [e => mock<EventInterface<Events["number_test"]>>({ get: () => e.get() * 20 })],
        expected: 25 * 20,
    },
};
describe("Dispatcher Test", () => {
    describe("Test data", () => {
        const dispatcher = new Dispatcher<Events>(mock<LoggerInterface>());
        const events: { [K in keyof Events]?: EventInterface<any> } = {};
        const callbacks: { [K in keyof Events]?: unknown[] } = {};
        for (const [name, item] of Object.entries(data) as [keyof Events, DataItem<any>][]) {
            events[name] = mock<EventInterface<any>>({ get: () => item.event });
            callbacks[name] = [];
            for (const implementation of item.implementations) {
                const cb = mock<CallbackInterface<any>>();
                cb.execute.mockImplementation(implementation);
                dispatcher.addListener(name, cb);
                callbacks[name as keyof Events].push(cb);
            }
        }
        for (const [name, event] of Object.entries(events)) {
            test(`Dispatch [${name}] event and check result`, () => {
                expect(dispatcher.dispatch(name as keyof Events, event).get()).toEqual(
                    data[name as keyof Events].expected
                );
            });
        }
        for (const [name, items] of Object.entries(callbacks)) {
            test(`Events of [${name}] has been called once`, () => {
                for (const callback of items) {
                    expect((callback as CallbackInterface<any>).execute).toHaveBeenCalledTimes(1);
                }
            });
        }
    });
});
