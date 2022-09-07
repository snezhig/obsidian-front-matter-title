import ExplorerSortFeature from "@src/Managers/Features/ExplorerSortFeature";
import {mock} from "jest-mock-extended";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import ExplorerViewUndefined from "@src/Managers/Exceptions/ExplorerViewUndefined";
import {TFileExplorerView, WorkspaceLeaf} from "obsidian";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import ObsidianFacade from "../../../../src/Obsidian/ObsidianFacade";
import DispatcherInterface from "../../../../src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import Event from "@src/Components/EventDispatcher/Event";

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const facade = mock<ObsidianFacade>();
let callback: CallbackInterface<any>;
const dispatcher = mock<DispatcherInterface<any>>();
dispatcher.addListener.mockImplementation((name, cb) => callback = cb);

const sort = new ExplorerSortFeature(
    mock<ResolverInterface<Resolving.Sync>>(),
    mock<LoggerInterface>(),
    facade,
    dispatcher
);

const view = mock<TFileExplorerView>();
// @ts-ignore
view.requestSort = jest.fn();

test('Should add listener', () => {
    expect(dispatcher.addListener).toHaveBeenCalledWith('manager:explorer:update', expect.anything());
    expect(dispatcher.addListener).toHaveBeenCalledTimes(1);
})

test('Should be disabled', () => expect(sort.isEnabled()).toBeFalsy());

test('Should throw exception because there is no explorer', () => expect(() => sort.enable()).rejects.toThrow(ExplorerViewUndefined));

test('Should not call requestSort', () => {
    callback.execute(new Event(undefined));
    expect(view.requestSort).not.toHaveBeenCalled();
})

test('Should be enabled', async () => {
    const leaf = mock<WorkspaceLeaf>();
    leaf.view = view;
    facade.getLeavesOfType.mockReturnValueOnce([leaf]);
    await sort.enable();
    expect(sort.isEnabled()).toBeTruthy();
})

test('Should init timer to find item', () => {
    expect(setTimeout).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(2);
})

test('Should call requestSort', () => {
    callback.execute(new Event(undefined));
    expect(view.requestSort).toHaveBeenCalledTimes(1);
    view.requestSort.mockClear();
})

test('Should switch off, requestSort and do not call requestSort by event', async () => {
    await sort.disable();
    expect(sort.isEnabled()).toBeFalsy();
    expect(view.requestSort).toHaveBeenCalledTimes(1)
    callback.execute(new Event({}));
    expect(view.requestSort).toHaveBeenCalledTimes(1)
})

test('Should not init times after disabling', () => {
    jest.runOnlyPendingTimers();
    expect(setTimeout).toHaveBeenCalledTimes(2);
})

