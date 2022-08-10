import {mock} from "jest-mock-extended";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import ExplorerManager from "@src/Managers/ExplorerManager";
import ExplorerViewUndefined from "@src/Managers/Exceptions/ExplorerViewUndefined";
import {TFileExplorerItem, TFileExplorerView} from "obsidian";

const resolverMock = mock<ResolverInterface<Resolving.Async>>();
const getFileItems = jest.fn(() => ({}));
const viewMock: TFileExplorerView = {
    get fileItems() {
        return getFileItems() as any
    }
} as TFileExplorerView;
const leavesGetterMock = jest.fn(() => []);


describe('Test enable exceptions', () => {
    const manager = new ExplorerManager(resolverMock, leavesGetterMock);
    test('Should throw error with undefined view', () => {
        leavesGetterMock.mockReturnValueOnce([]);
        expect(() => manager.enable()).toThrow(ExplorerViewUndefined);
        leavesGetterMock.mockReturnValueOnce([{}]);
        expect(() => manager.enable()).toThrow(ExplorerViewUndefined);
    })
    test('Should throw error because more than 1 leaf', () => {
        leavesGetterMock.mockReturnValueOnce([{}, {}]);
        expect(() => manager.enable()).toThrow("There are some explorers' leaves");
    })
})

test('Should do nothing because it is not enabled', () => {
    const manager = new ExplorerManager(resolverMock, leavesGetterMock);
    expect(manager.update()).resolves.toBeFalsy();
    expect(resolverMock.resolve).not.toHaveBeenCalled();
})

describe('Test flow', () => {
    beforeEach(() => resolverMock.resolve.mockClear());
    const items = {
        '/path/first.md': {file: {path: '/path/first.md'}, titleInnerEl: {innerText: 'first'}} as TFileExplorerItem,
        '/path/second.md': {file: {path: '/path/second.md'}, titleInnerEl: {innerText: 'second'}} as TFileExplorerItem,
    };
    getFileItems.mockReturnValue(items);
    leavesGetterMock.mockReturnValue([{view: viewMock}]);
    const manager = new ExplorerManager(resolverMock, leavesGetterMock);
    test('Should be enabled', () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    })

    test('Should not call resolver because explorer does not have files', async () => {
        getFileItems.mockReturnValueOnce({});
        expect(await manager.update()).toBeFalsy();
        expect(await manager.update('/path/file.md')).toBeFalsy();
        expect(resolverMock.resolve).not.toHaveBeenCalled();
    })

    test('Should call resolver, but update nothing', async () => {
        for (const value of [null, undefined, '']) {
            resolverMock.resolve.mockResolvedValue(value as any);
            expect(await manager.update()).toBeTruthy();
        }
        expect(resolverMock.resolve).toHaveBeenCalledTimes(6);

        expect(items['/path/first.md'].titleInnerEl.innerText).toEqual('first');
        expect(items['/path/second.md'].titleInnerEl.innerText).toEqual('second');
    })
    test('Should update only first item', async () => {
        const path = items['/path/first.md'].file.path;
        resolverMock.resolve.mockResolvedValueOnce('first_resolved' as any);
        await manager.update(path);
        expect(items['/path/first.md'].titleInnerEl.innerText).toEqual('first_resolved');
        expect(items['/path/second.md'].titleInnerEl.innerText).toEqual('second');
        expect(resolverMock.resolve).toHaveBeenCalledTimes(1);
        expect(resolverMock.resolve).toHaveBeenCalledWith(path);
    })
    test('Should update only second item', async () => {
        const path = items['/path/second.md'].file.path;
        resolverMock.resolve.mockResolvedValueOnce('second_resolved' as any);
        await manager.update(path);
        expect(items['/path/second.md'].titleInnerEl.innerText).toEqual('second_resolved');
        expect(items['/path/first.md'].titleInnerEl.innerText).toEqual('first_resolved');
        expect(resolverMock.resolve).toHaveBeenCalledTimes(1);
        expect(resolverMock.resolve).toHaveBeenCalledWith(path);
    })
})