import ProcessorListener from "../../../../src/Components/Processor/ProccessorListener";
import { AppEvents } from "../../../../src/Types";
import { ProcessorTypes } from "../../../../src/Components/Processor/ProcessorUtils";
import ListenerRef from "../../../../src/Components/EventDispatcher/Interfaces/ListenerRef";
import { Callback } from "../../../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import EventDispatcherMock from "../../../../__mocks__/EventDispatcherMock";
import Event from "../../../../src/Components/EventDispatcher/Event";
import { mock } from "jest-mock-extended";
import ProcessorInterface from "../../../../src/Components/Processor/Interfaces";
import { ResolverEvents } from "../../../../src/Resolver/ResolverType";

type Events = AppEvents & ResolverEvents;
const events: Map<ListenerRef<keyof Events>, Callback<Events[keyof Events]>> = new Map();

const mockDispatcher = new EventDispatcherMock<Events>(events);
const mockFactory = jest.fn();

const listener = new ProcessorListener(mockDispatcher, mockFactory);

beforeEach(() => {
    mockDispatcher.addListener.mockClear();
    mockDispatcher.removeListener.mockClear();
    mockFactory.mockClear();
});

test("Should not subscribe on anything in constructor", () => {
    expect(mockDispatcher.addListener).not.toHaveBeenCalled();
});

test("Should subscribe events on bind", () => {
    listener.bind();
    expect(mockDispatcher.addListener).toHaveBeenCalledWith({ name: "settings:changed", cb: expect.anything() });
    expect(mockDispatcher.addListener).toHaveBeenCalledWith({
        name: "settings.loaded",
        cb: expect.anything(),
        once: true,
    });
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(2);
});

test("Should not do anything on settings loaded, because processor is null", () => {
    mockDispatcher.dispatch("settings.loaded", new Event({ settings: { processor: { type: null } } }));
    expect(mockFactory).not.toHaveBeenCalled();
    expect(mockDispatcher.addListener).not.toHaveBeenCalled();
});

test("Should create a processor and bind new event", () => {
    mockDispatcher.dispatch(
        "settings.loaded",
        new Event({ settings: { processor: { type: ProcessorTypes.Function, args: ["foo"] } } })
    );
    expect(mockFactory).toHaveBeenCalledTimes(1);
    expect(mockFactory).toHaveBeenCalledWith(ProcessorTypes.Function, ["foo"]);
    expect(mockDispatcher.addListener).toHaveBeenCalledWith({ name: "resolver:resolved", cb: expect.anything() });
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
});

test("Should create new processor without binding new event", () => {
    mockDispatcher.dispatch(
        "settings:changed",
        new Event({ actual: { processor: { type: ProcessorTypes.Replace, args: ["bar"] } } })
    );
    expect(mockFactory).toHaveBeenCalledTimes(1);
    expect(mockFactory).toHaveBeenCalledWith(ProcessorTypes.Replace, ["bar"]);
    expect(mockDispatcher.addListener).not.toHaveBeenCalled();
});

test("Should unbinb 'resolver:resolved' ref, because processor is null", () => {
    const ref = Array.from(events.keys()).find(e => e.getName() === "resolver:resolved");
    mockDispatcher.dispatch("settings:changed", new Event({ actual: { processor: { type: null } } }));
    expect(ref).not.toBeNull();
    expect(mockFactory).not.toHaveBeenCalled();
    expect(mockDispatcher.addListener).not.toHaveBeenCalled();
    expect(mockDispatcher.removeListener).toHaveBeenCalledWith(ref);
});

describe("Test 'resolver:resolved' listener", () => {
    const mockProcessor = mock<ProcessorInterface>();
    beforeEach(() => mockProcessor.process.mockClear());
    beforeAll(() => {
        mockProcessor.process.mockReturnValue(null);
        mockFactory.mockReturnValueOnce(mockProcessor);
        mockDispatcher.dispatch(
            "settings:changed",
            new Event({ actual: { processor: { type: ProcessorTypes.Function } } })
        );
    });
    const modify = jest.fn();
    const dispatch = (value: any) => {
        mockDispatcher.dispatch("resolver:resolved", new Event({ modify, value }));
    };

    test("Should call processor, but withour modify value", () => {
        dispatch("foo");
        expect(mockProcessor.process).toHaveBeenCalledWith("foo");
        expect(mockProcessor.process).toHaveBeenCalledTimes(1);
        expect(modify).not.toHaveBeenCalled();
    });

    test("Should call processor and modify the value", () => {
        const changed = "bar";
        mockProcessor.process.mockReturnValueOnce(changed);
        dispatch("foo");
        expect(mockProcessor.process).toHaveBeenCalledWith("foo");
        expect(mockProcessor.process).toHaveBeenCalledTimes(1);
        expect(modify).toHaveBeenCalledTimes(1);
        expect(modify).toHaveBeenCalledWith(changed);
    });

    test("Should not call processir, becuase value is not a string", () => {
        dispatch({});
        dispatch(null);
        dispatch(false);
        dispatch(10);
        expect(mockProcessor.process).not.toHaveBeenCalled();
    });
});
