import { mock } from "jest-mock-extended";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature } from "@src/enum";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { SearchPluginView, SearchViewDOM, TFile } from "obsidian";
import SearchManager from "@src/Feature/Search/SearchManager";

const addResult = jest.fn();
const mockDom = mock<SearchViewDOM>({ addResult }, { deep: true });
const mockView = mock<SearchPluginView>({ dom: mockDom });
const mockReplacer = mock<FunctionReplacer<SearchViewDOM, "addResult", SearchManager>>();
let implementation: (manager: SearchManager, args: unknown[], v: () => any) => any = null;
const spyCreate = jest.spyOn(FunctionReplacer, "create").mockImplementation((t, m, a, i) => {
    //@ts-ignore
    implementation = i;
    return mockReplacer;
});
const mockFacade = mock<ObsidianFacade>();
const mockResolver = mock<ResolverInterface>();
const manager = new SearchManager(mockFacade, mockResolver, mock<LoggerInterface>());

test(`Should return ${Feature.Search}`, () => expect(manager.getId()).toEqual(Feature.Search));

describe("Test unsuccessful attempts to enable manager", () => {
    beforeEach(() => mockFacade.getViewsOfType.mockClear());
    test("Should be disabled, because view does not found", () => {
        manager.enable();
        expect(manager.isEnabled()).toBeFalsy();
        expect(spyCreate).not.toHaveBeenCalled();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    });

    test("Should be disabled, because view does not have dom", () => {
        mockFacade.getViewsOfType.mockReturnValueOnce([mock<SearchPluginView>({ dom: null })]);
        manager.enable();
        expect(manager.isEnabled()).toBeFalsy();
        expect(spyCreate).not.toHaveBeenCalled();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    });
});

test("Should not call anything because it`s disabled", async () => {
    mockFacade.getViewsOfType.mockClear();
    await manager.refresh();
    expect(manager.isEnabled()).toBeFalsy();
    expect(mockFacade.getViewsOfType).not.toHaveBeenCalled();
});

describe("Test enabled state", () => {
    beforeAll(() => {
        mockFacade.getViewsOfType.mockClear();
        mockFacade.getViewsOfType.mockReturnValue([mockView]);
    });
    beforeEach(() => {
        mockView.startSearch.mockClear();
    });

    test("Should be enabled", () => {
        //Call twice, but second call should not call dependencies twice
        manager.enable();
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(2);
        expect(spyCreate).toHaveBeenCalledTimes(1);
        expect(mockReplacer.enable).toHaveBeenCalledTimes(1);
        expect(mockView.startSearch).toHaveBeenCalledTimes(1);
    });

    test("Should call startSearch because update all", async () => {
        await manager.refresh();
        expect(mockView.startSearch).toHaveBeenCalledTimes(1);
    });
    test("Should not call startSearch because does not have passed path", async () => {
        mockDom.resultDomLookup = new Map();
        await manager.update("any/path/file.md");
        expect(mockView.startSearch).not.toHaveBeenCalled();
    });

    test("Should call startSearch, because has passed path", async () => {
        const path = "path/to/file.md";
        mockDom.resultDomLookup = new Map([[mock<TFile>({ path }), undefined]]);
        await manager.update(path);
        expect(mockView.startSearch).toHaveBeenCalledTimes(1);
    });

    describe("Test replacing of addResult", () => {
        const mockContainer = mock<Element>();
        const mockResult = { containerEl: mockContainer };
        const path = "path/to/file.md";
        beforeAll(() => {
            addResult.mockReturnValue(mockResult);
        });
        beforeEach(() => {
            addResult.mockClear();
            mockResolver.resolve.mockClear();
        });
        test("Should not call resolver becase the extension is not md", () => {
            implementation(manager, [mock<TFile>()], addResult);
            expect(mockResolver.resolve).not.toHaveBeenCalled();
            expect(mockContainer.find).not.toHaveBeenCalled();
        });
        test("Should call resolver, not find the inner item because title is null", () => {
            implementation(manager, [mock<TFile>({ extension: "md", path })], addResult);
            expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
            expect(mockResolver.resolve).toHaveBeenCalledWith(path);
            expect(mockContainer.find).not.toHaveBeenCalled();
        });
        test("Should call resolver, find the inner item and call setText", () => {
            const mockInner = mock<Element>();
            const title = "new_title";
            mockContainer.find.mockReturnValueOnce(mockInner);
            mockResolver.resolve.mockReturnValueOnce(title);
            implementation(manager, [mock<TFile>({ extension: "md", path })], addResult);

            expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
            expect(mockResolver.resolve).toHaveBeenCalledWith(path);

            expect(mockContainer.find).toHaveBeenCalledTimes(1);
            expect(mockContainer.find).toHaveBeenCalledWith(".tree-item-inner");

            expect(mockInner.setText).toHaveBeenCalledTimes(1);
            expect(mockInner.setText).toHaveBeenCalledWith(title);
        });
    });
});

test("Should be disabled", async () => {
    await manager.disable();
    expect(manager.isEnabled()).toBeFalsy();
    expect(mockReplacer.disable).toHaveBeenCalledTimes(1);
});
