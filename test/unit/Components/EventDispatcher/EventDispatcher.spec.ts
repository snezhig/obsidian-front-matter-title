import { EventDispatcher } from "@src/Components/EventDispatcher/EventDispatcher";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { mock } from "jest-mock-extended";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

type Events = {
    foo: null;
    baz: undefined;
    fred: { spam: number };
};

const dispatcher: EventDispatcherInterface<Events> = new EventDispatcher(mock<LoggerInterface>());

describe("Test add listener, call and remove by ref", () => {
    let actual = "";

    const fooListener = jest.fn(() => (actual += "a"));
    const barListener = jest.fn(() => (actual += "b"));
    const bazListener = jest.fn(() => (actual += "c"));
    const bazRef = dispatcher.addListener({ cb: bazListener, name: "foo", sort: 100 });
    const barRef = dispatcher.addListener({ cb: barListener, name: "foo" });
    const fooRef = dispatcher.addListener({ cb: fooListener, name: "foo", sort: 50 });

    beforeEach(() => {
        fooListener.mockClear();
        barListener.mockClear();
        bazListener.mockClear();
        actual = "";
    });
    test("Should add listeners and call them in right order", () => {
        dispatcher.dispatch("foo", null);
        dispatcher.dispatch("foo", null);

        expect(fooListener).toHaveBeenCalledTimes(2);
        expect(barListener).toHaveBeenCalledTimes(2);
        expect(bazListener).toHaveBeenCalledTimes(2);

        expect(actual).toEqual("acbacb");
    });

    test("Refs should contains foo names", () => {
        expect(fooRef.getName()).toEqual("foo");
        expect(barRef.getName()).toEqual("foo");
        expect(bazRef.getName()).toEqual("foo");
    });

    test("Should remove baz listener", () => {
        dispatcher.removeListener(bazRef);
        dispatcher.dispatch("foo", null);
        expect(fooListener).toHaveBeenCalledTimes(1);
        expect(barListener).toHaveBeenCalledTimes(1);
        expect(bazListener).not.toHaveBeenCalled();
        expect(actual).toEqual("ab");
    });
});

test("Should call listener only once", () => {
    const listener = jest.fn();
    const onceFoo = jest.fn();
    const onceBar = jest.fn();

    dispatcher.addListener({ name: "baz", cb: onceFoo, once: true });
    dispatcher.addListener({ name: "baz", cb: listener });
    dispatcher.addListener({ name: "baz", cb: onceBar, once: true });

    dispatcher.dispatch("baz", null);
    dispatcher.dispatch("baz", null);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(onceFoo).toHaveBeenCalledTimes(1);
    expect(onceBar).toHaveBeenCalledTimes(1);
});
