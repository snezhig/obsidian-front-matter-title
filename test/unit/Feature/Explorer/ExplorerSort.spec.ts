import { mock } from "jest-mock-extended";
import { TFileExplorerView, WorkspaceLeaf } from "obsidian";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import ObsidianFacade from "../../../../src/Obsidian/ObsidianFacade";
import Event from "@src/Components/EventDispatcher/Event";
import { Feature } from "@src/Enum";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";
import EventDispatcherInterface, {
    Callback,
} from "../../../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import FeatureService from "@src/Feature/FeatureService";
import { ResolverInterface } from "@src/Resolver/Interfaces";

jest.useFakeTimers();
jest.spyOn(global, "setTimeout");

const facade = mock<ObsidianFacade>();
let callback: Callback<AppEvents[keyof AppEvents]>;
const mockDispatcher = mock<EventDispatcherInterface<any>>();
const refs: [any?, any?] = [];
mockDispatcher.addListener.mockImplementation(({ name, cb }) => {
    callback = cb;
    const ref = { getName: () => name };
    refs.push(ref);
    return ref;
});
const mockFeatureService = mock<FeatureService>();
mockFeatureService.createResolver.mockReturnValue(mock<ResolverInterface>());
const sort = new ExplorerSort(mock<LoggerInterface>(), facade, mockDispatcher, mockFeatureService);

const view = mock<TFileExplorerView>();
// @ts-ignore
view.requestSort = jest.fn();

test("Should be disabled", () => expect(sort.isEnabled()).toBeFalsy());

test("Should throw exception because there is no explorer", () =>
    expect(() => sort.enable()).rejects.toThrow(ExplorerViewUndefined));

test("Should add listener after enabled", async () => {
    const leaf = mock<WorkspaceLeaf>();
    leaf.view = view;
    facade.getLeavesOfType.mockReturnValueOnce([leaf]);
    await sort.enable();
    expect(sort.isEnabled()).toBeTruthy();
    expect(mockDispatcher.addListener).toHaveBeenCalledWith({ name: "manager:update", cb: expect.anything() });
    expect(mockDispatcher.addListener).toHaveBeenCalledWith({ name: "manager:refresh", cb: expect.anything() });
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(2);
});

test("Should init timer to find item", () => {
    expect(setTimeout).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(2);
});

test("Should call requestSort", () => {
    callback(new Event({ id: Feature.Explorer, result: true }));
    expect(view.requestSort).toHaveBeenCalledTimes(1);
    view.requestSort.mockClear();
});

test("Should switch off, requestSort and do not call requestSort by event", async () => {
    await sort.disable();
    expect(sort.isEnabled()).toBeFalsy();
    expect(view.requestSort).toHaveBeenCalledTimes(1);
    expect(mockDispatcher.removeListener).toHaveBeenCalledTimes(2);
    expect(mockDispatcher.removeListener).toHaveBeenCalledWith(refs[0]);
    expect(mockDispatcher.removeListener).toHaveBeenCalledWith(refs[1]);
    callback(new Event({ id: Feature.Explorer }));
    expect(view.requestSort).toHaveBeenCalledTimes(1);
});

test("Should not init times after disabling", () => {
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(2);
});

test("Should not dispatch anything", () => {
    expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
});
