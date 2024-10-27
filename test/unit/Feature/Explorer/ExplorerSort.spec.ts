import { mock, MockProxy } from "jest-mock-extended";
import { TFileExplorerItem, TFileExplorerView, TFolder } from "obsidian";
import ObsidianFacade from "../../../../src/Obsidian/ObsidianFacade";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";
import EventDispatcherInterface, {
    Callback,
} from "../../../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import FeatureService from "@src/Feature/FeatureService";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { FunctionReplacerFactory } from "@config/inversify.factory.types";
import FunctionReplacer from "../../../../src/Utils/FunctionReplacer";
import Event from "@src/Components/EventDispatcher/Event";
import { Feature } from "@src/Enum";

let facade: MockProxy<ObsidianFacade>;
let callback: Callback<AppEvents[keyof AppEvents]>;
let dispatcher: MockProxy<EventDispatcherInterface<any>>;
let refs: [any?, any?];
let featureService: MockProxy<FeatureService>;
let sort: ExplorerSort;
let view: MockProxy<TFileExplorerView>;
let replacerFactory: jest.Mock<
    ReturnType<FunctionReplacerFactory<TFileExplorerView, "getSortedFolderItems", ExplorerSort>>
>;

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
    view = mock<TFileExplorerView>();
    replacerFactory = jest.fn();
    // @ts-ignore
    view.requestSort = jest.fn();
    sort = new ExplorerSort(mock<LoggerInterface>(), facade, dispatcher, featureService, replacerFactory);
});

describe("ExplorerSort", () => {
    test("should be stopped by default", () => expect(sort.isStarted()).toBeFalsy());

    test("should throw exception because there is no explorer", () => {
        expect(() => sort.start()).toThrow(ExplorerViewUndefined);
    });

    describe("with view", () => {
        beforeEach(() => {
            facade.getViewsOfType.mockReturnValue([view]);
        });

        describe("with explorer item", () => {
            let replacer: FunctionReplacer<TFileExplorerView, "getSortedFolderItems", ExplorerSort>;
            let item: TFileExplorerItem;
            beforeEach(() => {
                item = mock<TFileExplorerItem>();
                item.file = new TFolder();
                replacer = mock<FunctionReplacer<TFileExplorerView, "getSortedFolderItems", ExplorerSort>>();
                replacerFactory.mockImplementationOnce(() => replacer);
            });

            afterEach(() => {
                expect(dispatcher.addListener).toHaveBeenCalledWith({ name: "manager:update", cb: expect.anything() });
                expect(dispatcher.addListener).toHaveBeenCalledWith({ name: "manager:refresh", cb: expect.anything() });
                expect(dispatcher.addListener).toHaveBeenCalledTimes(2);
            });

            test("Should create function replacer without delay, because there is folder item", () => {
                view.fileItems["mock"] = item;
                sort.start();
                expect(replacerFactory).toBeCalled();
                expect(replacer.enable).toBeCalled();
            });

            test("should not trigger vanilla sort because event is not suitable", () => {
                view.fileItems["mock"] = item;
                sort.start();
                callback(new Event({ id: Feature.Explorer, result: false }));
                callback(new Event({ id: Feature.Tab, result: false }));
                expect(view.requestSort).not.toHaveBeenCalled();
            });

            test("should trigger requestSort because event is suitable", () => {
                view.fileItems["mock"] = item;
                sort.start();
                callback(new Event({ id: Feature.Explorer, result: true }));
                expect(view.requestSort).toHaveBeenCalledTimes(1);
            });

            test("should disable replacer and remove listener after stop", () => {
                view.fileItems["mock"] = item;
                sort.start();
                sort.stop();
                expect(replacer.disable).toBeCalled();
                expect(dispatcher.removeListener).toHaveBeenCalledWith(refs[0]);
                expect(dispatcher.removeListener).toHaveBeenCalledWith(refs[1]);
            });
        });
    });
});
