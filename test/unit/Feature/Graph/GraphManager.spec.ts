import { mock } from "jest-mock-extended";
import EventDispatcherInterface, {
    Callback,
} from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import GraphManager from "@src/Feature/Graph/GraphManager";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature } from "@src/enum";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import { GraphNode, GraphView } from "obsidian";
import FunctionReplacer from "@src/Utils/FunctionReplacer";

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");
Array.prototype.first = function () {
    return this[0];
};

const mockFactory = jest.fn();
const mockDispatcher = mock<EventDispatcherInterface<AppEvents>>();
const mockFacade = mock<ObsidianFacade>({ getViewsOfType: jest.fn(() => []) });
const mockResolver = mock<ResolverInterface>();

test(`Should return ${Feature.Graph} as Id`, () => {
    const manager = new GraphManager(mockDispatcher, mockFacade, mockResolver, mockFactory, mock<LoggerInterface>());
    expect(GraphManager.getId()).toEqual(Feature.Graph);
    expect(manager.getId()).toEqual(Feature.Graph);
});

describe("Flow is case the graph is not opened yet", () => {
    const manager = new GraphManager(mockDispatcher, mockFacade, mockResolver, mockFactory, mock<LoggerInterface>());
    const mockReplacer = mock<FunctionReplacer<any, any, any>>();

    let callback: Callback<AppEvents["layout:change"]> = null;
    let ref: ListenerRef<any> = null;
    const getText = {
        original: jest.fn(() => "original"),
        stub: (args: unknown, defaultArgs: unknown, vanilla: unknown) => "",
    };

    beforeAll(() => {
        mockDispatcher.addListener.mockImplementationOnce(({ cb, name }) => {
            callback = cb;
            ref = { getName: () => name };
            return ref;
        });
        mockFactory.mockImplementationOnce((t, m, a, implementation) => {
            getText.stub = implementation;
            return mockReplacer;
        });
    });
    afterEach(() => {
        mockFacade.getViewsOfType.mockClear();
        mockResolver.resolve.mockClear();
        mockDispatcher.addListener.mockClear();
        mockFactory.mockClear();
    });

    test("Should be enabled and bind listener", () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
        expect(callback).not.toBeNull();
        expect(ref).not.toBeNull();
        expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.addListener).toBeCalledWith({ name: "layout:change", cb: callback });
        expect(mockFacade.getViewsOfType).toBeCalledTimes(4);
    });

    test("Should unbind and try init through timeout, because there are leaves, but without nodes", () => {
        mockFacade.getViewsOfType.mockImplementation(() => [mock<GraphView>()]);
        callback(null);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(4);
        expect(mockDispatcher.removeListener).toHaveBeenCalledWith(ref);

        const view = mock<GraphView>(
            {
                renderer: {
                    onIframeLoad: jest.fn(),
                    nodes: [mock<GraphNode>()],
                },
            },
            { deep: true }
        );
        mockFacade.getViewsOfType.mockImplementation(() => [view]);

        jest.runAllTimers();

        expect(mockFactory).toHaveBeenCalledTimes(1);
        expect(mockReplacer.enable).toHaveBeenCalledTimes(1);
        expect(view.renderer.onIframeLoad).toHaveBeenCalledTimes(2);
    });

    test("Should call resolver and return it`s value through replacer implementation", () => {
        mockResolver.resolve.mockReturnValueOnce("resolved");
        const result = getText.stub(manager, [], getText.original);
        expect(result).toEqual("resolved");
        expect(getText.original).not.toBeCalled();
        expect(mockResolver.resolve).toBeCalledTimes(1);
    });

    test("Should call vanilla getText", () => {
        expect(getText.stub(manager, [], getText.original)).toEqual("original");
        expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
        expect(getText.original).toBeCalledTimes(1);
    });

    test("Should disable resolve and be disabled", () => {
        expect(mockReplacer.disable).not.toHaveBeenCalled();
        manager.disable();
        expect(manager.isEnabled()).toBeFalsy();
        expect(mockReplacer.disable).toHaveBeenCalled();
    });
});

describe("Flow in case graph is opened already", () => {
    const manager = new GraphManager(mockDispatcher, mockFacade, mockResolver, mockFactory, mock<LoggerInterface>());
    const mockReplacer = mock<FunctionReplacer<any, any, any>>();
    const renderer = {
        nodes: [mock<GraphNode>()],
        onIframeLoad: jest.fn(),
    };
    beforeAll(() => {
        mockFacade.getViewsOfType.mockImplementationOnce(() => [mock<GraphView>({ renderer })]);
        mockFactory.mockReturnValueOnce(mockReplacer);
    });

    test("Should not bind listener, but be enabled and create replacer", () => {
        expect(manager.isEnabled()).toBeFalsy();
        expect(renderer.onIframeLoad).not.toBeCalled();

        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();

        expect(mockFacade.getViewsOfType).toBeCalledTimes(2);
        expect(mockFactory).toBeCalledTimes(1);
        expect(mockReplacer.enable).toBeCalledTimes(1);
        expect(mockDispatcher.addListener).not.toBeCalled();
    });

    test("Should reload only one view", async () => {
        const fooIFrameLoad = jest.fn();
        const barIFrameLoad = jest.fn();
        mockFacade.getViewsOfType.mockReturnValueOnce([
            mock<GraphView>({
                renderer: { onIframeLoad: fooIFrameLoad, nodes: [mock<GraphNode>({ id: "foo" })] },
            }),
        ]);
        mockFacade.getViewsOfType.mockReturnValueOnce([
            mock<GraphView>({
                renderer: { onIframeLoad: barIFrameLoad, nodes: [mock<GraphNode>({ id: "bar" })] },
            }),
        ]);

        expect(await manager.update("foo")).toBeTruthy();
        expect(fooIFrameLoad).toBeCalled();
        expect(barIFrameLoad).not.toBeCalled();
    });
    test("Should not reload view", async () => {
        const onIframeLoad = jest.fn();
        mockFacade.getViewsOfType.mockReturnValueOnce([
            mock<GraphView>({ renderer: { onIframeLoad: onIframeLoad, nodes: undefined } }),
        ]);
        expect(await manager.update("foo")).toBeFalsy();
        expect(onIframeLoad).not.toBeCalled();
    });
});
