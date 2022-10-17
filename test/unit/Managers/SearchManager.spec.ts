import SearchManager from "@src/Managers/SearchManager";
import {mock} from "jest-mock-extended";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import {Manager} from "@src/enum";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import {SearchPluginView, SearchViewDOM, TFile} from "obsidian";

const mockDom = mock<SearchViewDOM>(undefined, {deep: true});
const mockView = mock<SearchPluginView>({dom: mockDom});
const mockReplacer = mock<FunctionReplacer<SearchViewDOM, 'addResult', SearchManager>>();
const spyCreate = jest.spyOn(FunctionReplacer, 'create').mockImplementation(() => mockReplacer);
const mockFacade = mock<ObsidianFacade>();
const mockResolver = mock<ResolverInterface>();
const manager = new SearchManager(mockFacade, mockResolver, mock<LoggerInterface>());


test(`Should return ${Manager.Search}`, () => expect(manager.getId()).toEqual(Manager.Search));

describe('Test unsuccessful attempts to enable manager', () => {
    beforeEach(() => mockFacade.getViewsOfType.mockClear())
    test('Should be disabled, because view does not found', async () => {
        await manager.enable();
        expect(manager.isEnabled()).toBeFalsy();
        expect(spyCreate).not.toHaveBeenCalled();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    })

    test('Should be disabled, because view does not have dom', async () => {
        mockFacade.getViewsOfType.mockReturnValueOnce([mock<SearchPluginView>({dom: null})]);
        await manager.enable();
        expect(manager.isEnabled()).toBeFalsy();
        expect(spyCreate).not.toHaveBeenCalled();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    })
})

test('Should not call anything because it`s disabled', async () => {
    mockFacade.getViewsOfType.mockClear();
    await manager.update();
    expect(manager.isEnabled()).toBeFalsy();
    expect(mockFacade.getViewsOfType).not.toHaveBeenCalled();
})

describe('Test enabled state', () => {
    beforeAll(() => {
        mockFacade.getViewsOfType.mockClear();
        mockFacade.getViewsOfType.mockReturnValue([mockView]);
    })
    beforeEach(() => {
        mockView.startSearch.mockClear();
    })

    test('Should be enabled', async () => {
        //Call twice, but second call should not call dependencies twice
        await manager.enable();
        await manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(2);
        expect(spyCreate).toHaveBeenCalledTimes(1);
        expect(mockReplacer.enable).toHaveBeenCalledTimes(1);
        expect(mockView.startSearch).toHaveBeenCalledTimes(1);
    })

    test('Should call startSearch because update all', async () => {
        await manager.update();
        expect(mockView.startSearch).toHaveBeenCalledTimes(1);
    })
    test('Should not call startSearch because does not have passed path', async () => {
        mockDom.resultDomLookup = new Map();
        await manager.update('any/path/file.md');
        expect(mockView.startSearch).not.toHaveBeenCalled();
    })

    test('Should call startSearch, because has passed path', async () => {
        const path = 'path/to/file.md';
        mockDom.resultDomLookup = new Map([
            [mock<TFile>({path}), undefined]
        ]);
        await manager.update(path);
        expect(mockView.startSearch).toHaveBeenCalledTimes(1);
    })
});

test('Should be disabled', async () => {
    await manager.disable();
    expect(manager.isEnabled()).toBeFalsy();
    expect(mockReplacer.disable).toHaveBeenCalledTimes(1);
})


