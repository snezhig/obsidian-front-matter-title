import {mock} from "jest-mock-extended";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import {getLeavesOfType} from "@src/Obsidian/Types";
import ExplorerManager from "@src/Managers/ExplorerManager";
import ExplorerViewUndefined from "@src/Managers/Exceptions/ExplorerViewUndefined";
import {TFileExplorerView} from "obsidian";

const resolverMock = mock<ResolverInterface<Resolving.Async>>();
const viewMock = mock<TFileExplorerView>();
viewMock.fileItems = [] as any;
const leavesGetterMock = jest.fn(() => []);


describe('Test enable exceptions', ()=> {
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
    leavesGetterMock.mockReturnValue([{view: viewMock}]);
    const manager = new ExplorerManager(resolverMock, leavesGetterMock);
    test('Should be enabled', () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    })

    test('Should not call resolver because explorer does not have files', async () => {
        expect(await manager.update()).toBeFalsy();
        expect(await manager.update('/path/file.md')).toBeFalsy();
        expect(resolverMock.resolve).not.toHaveBeenCalled();
    })

    test('', () => {

    })
})