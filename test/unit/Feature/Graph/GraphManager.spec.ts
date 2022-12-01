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

const mockReplacer = mock<FunctionReplacer<any, any, any>>();
const mockFactory = jest.fn(() => mockReplacer);
const mockDispatcher = mock<EventDispatcherInterface<AppEvents>>();
const mockFacade = mock<ObsidianFacade>({ getViewsOfType: jest.fn(() => []) });
const mockResolver = mock<ResolverInterface>();

const manager = new GraphManager(mockDispatcher, mockFacade, mockResolver, mockFactory, mock<LoggerInterface>());

test(`Should return ${Feature.Graph} as Id`, () => {
    expect(GraphManager.getId()).toEqual(Feature.Graph);
    expect(manager.getId()).toEqual(Feature.Graph);
});

describe("Flow is case the graph is not opened yet", () => {
    let callback: Callback<AppEvents["layout:change"]> = null;
    let ref: ListenerRef<any> = null;
    beforeAll(() =>
        mockDispatcher.addListener.mockImplementationOnce(({ cb, name }) => {
            callback = cb;
            ref = { getName: () => name };
            return ref;
        })
    );
    afterEach(() => {
        mockFacade.getViewsOfType.mockClear();
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
});
