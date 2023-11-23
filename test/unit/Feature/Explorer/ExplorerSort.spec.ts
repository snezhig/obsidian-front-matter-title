import { mock, MockProxy } from "jest-mock-extended";
import { TFileExplorerView } from "obsidian";
import ObsidianFacade from "../../../../src/Obsidian/ObsidianFacade";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";
import EventDispatcherInterface, {
    Callback,
} from "../../../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import FeatureService from "@src/Feature/FeatureService";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import { DelayerInterface } from "@src/Components/Delayer/Delayer";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

let facade: MockProxy<ObsidianFacade>;
let callback: Callback<AppEvents[keyof AppEvents]>;
let dispatcher: MockProxy<EventDispatcherInterface<any>>;
let refs: [any?, any?];
let featureService: MockProxy<FeatureService>;
let delayer: MockProxy<DelayerInterface>;
let sort: ExplorerSort;
let view: MockProxy<TFileExplorerView>;

beforeEach(() => {
    refs = [];
    facade = mock<ObsidianFacade>();
    dispatcher = mock<EventDispatcherInterface<any>>();
    dispatcher.addListener.mockImplementation(({ name, cb }) => {
        callback = cb;
        const ref = { getName: () => name };
        refs.push(ref);
        return ref;
    });
    featureService = mock<FeatureService>();
    featureService.createResolver.mockReturnValue(mock<ResolverInterface>());
    delayer = mock<DelayerInterface>();
    view = mock<TFileExplorerView>();
    // @ts-ignore
    view.requestSort = jest.fn();
    sort = new ExplorerSort(mock<LoggerInterface>(), facade, dispatcher, featureService, delayer);
});

describe("ExplorerSort", () => {
    test("should be stopped by default", () => expect(sort.isStarted()).toBeFalsy());

    test("should throw exception because there is no explorer", () => {
        expect(() => sort.start()).toThrow(ExplorerViewUndefined);
    });

    describe("with view", () => {
        beforeEach(() => facade.getViewsOfType.mockReturnValue([view]));

        test("should add listener after enabled", () => {
            sort.start();
            expect(sort.isStarted()).toBeTruthy();
            expect(dispatcher.addListener).toHaveBeenCalledWith({ name: "manager:update", cb: expect.anything() });
            expect(dispatcher.addListener).toHaveBeenCalledWith({ name: "manager:refresh", cb: expect.anything() });
            expect(dispatcher.addListener).toHaveBeenCalledTimes(2);
        });
        //
        test("should delay replace because these is not item", () => {
            let fn: Function;
            //copy delayed function to call it manually
            delayer.delay.mockImplementation(f => {
                fn = f;
                return 0;
            });
            //enable sort to trigger internal "tryToReplaceOriginalSort"
            sort.start();
            expect(delayer.delay).toHaveBeenCalledTimes(1);
            //Call delayed function
            fn();
            expect(delayer.delay).toHaveBeenCalledTimes(2);
        });
        //
        // test("Should call requestSort", () => {
        //     callback(new Event({ id: Feature.Explorer, result: true }));
        //     expect(view.requestSort).toHaveBeenCalledTimes(1);
        //     view.requestSort.mockClear();
        // });
        //
        // test("Should switch off, requestSort and do not call requestSort by event", async () => {
        //     await sort.stop();
        //     expect(sort.isStarted()).toBeFalsy();
        //     expect(view.requestSort).toHaveBeenCalledTimes(1);
        //     expect(dispatcher.removeListener).toHaveBeenCalledTimes(2);
        //     expect(dispatcher.removeListener).toHaveBeenCalledWith(refs[0]);
        //     expect(dispatcher.removeListener).toHaveBeenCalledWith(refs[1]);
        //     callback(new Event({ id: Feature.Explorer }));
        //     expect(view.requestSort).toHaveBeenCalledTimes(1);
        // });
        //
        // test("Should not init times after disabling", () => {
        //     jest.runOnlyPendingTimers();
        //     expect(setTimeout).toHaveBeenCalledTimes(2);
        // });
        //
        // test("Should not dispatch anything", () => {
        //     expect(dispatcher.dispatch).not.toHaveBeenCalled();
        // });
    });
});
