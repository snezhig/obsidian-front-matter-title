import { mock, mockDeep, mockReset } from "jest-mock-extended";
import { TFile, TFileExplorerItem, TFileExplorerLeaf, TFileExplorerView, WorkspaceLeafExt } from "obsidian";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { ExplorerFileItemMutator } from "@src/Feature/Explorer/ExplorerFileItemMutator";
import ExplorerManager from "../../../../src/Feature/Explorer/ExplorerManager";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import ExplorerViewUndefined from "../../../../src/Feature/Explorer/ExplorerViewUndefined";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Plugins } from "@src/Enum";

// Mock dependencies
const facadeMock = mock<ObsidianFacade>();
const factory = jest.fn();
const resolver = mock<ResolverInterface>();

// Mock methods and properties that will be used in the tests
facadeMock.getLeavesOfType.mockReturnValue([]);
factory.mockImplementation(() => mock<ExplorerFileItemMutator>());

describe("ExplorerManager", () => {
    let explorerManager: ExplorerManager;
    let explorerSortMock: ExplorerSort;
    let sortFactoryMock: jest.Mock<ReturnType<() => ExplorerSort | null>>;
    const dispatcherMock: EventDispatcherInterface<AppEvents> = mock<EventDispatcherInterface<AppEvents>>();
    const loggerMock: LoggerInterface = mock<LoggerInterface>();

    beforeEach(() => {
        // Reset all mocks before each test
        mockReset(facadeMock);
        mockReset(resolver);
        factory.mockClear();

        // Create an instance of the class to be tested
        facadeMock.isInternalPluginEnabled.mockImplementation((id: string) => Plugins.FileExplorer === id);
        explorerSortMock = mock<ExplorerSort>();
        sortFactoryMock = jest.fn().mockReturnValue(explorerSortMock);
        explorerManager = new ExplorerManager(facadeMock, factory, sortFactoryMock, dispatcherMock, loggerMock);
        explorerManager.setResolver(resolver);
    });

    it("should start the explorer feature", () => {
        const leafMock = mock<TFileExplorerLeaf>({ view: mock<TFileExplorerView>() });
        leafMock.isVisible.mockReturnValue(true);
        facadeMock.getLeavesOfType.mockReturnValue([leafMock]);
        explorerManager.enable();

        expect(explorerManager.isEnabled()).toBe(true);
        expect(leafMock.isVisible).toHaveBeenCalled();
    });

    it("should throw an error if multiple explorer views are found", () => {
        facadeMock.getLeavesOfType.mockReturnValue([
            mock<TFileExplorerLeaf>({ view: mockDeep<TFileExplorerView>() }),
            mock<TFileExplorerLeaf>({ view: mockDeep<TFileExplorerView>() }),
        ]);

        expect(() => {
            explorerManager.enable();
        }).toThrow("There are some explorers' leaves");
    });

    it("should stop the explorer feature", () => {
        const explorerViewMock = mockDeep<TFileExplorerView>();
        const explorerLeafMock = mock<TFileExplorerLeaf>({ view: explorerViewMock });
        explorerLeafMock.isVisible.mockReturnValue(true);
        facadeMock.getLeavesOfType.mockReturnValue([explorerLeafMock]);

        explorerManager.enable();
        explorerManager.disable();

        expect(explorerManager.isEnabled()).toBe(false);
        expect(explorerLeafMock.isVisible).toHaveBeenCalled();
    });

    it("doRefresh should update titles of all file items", async () => {
        const explorerViewMock = mock<TFileExplorerView>();
        const explorerLeafMock = mock<TFileExplorerLeaf>({ view: explorerViewMock });
        explorerLeafMock.isVisible.mockReturnValue(true);
        const fileItemMock = mock<TFileExplorerItem>();
        fileItemMock.file = new TFile();
        explorerViewMock.fileItems = { path: fileItemMock };
        facadeMock.getLeavesOfType.mockReturnValue([explorerLeafMock]);

        explorerManager.enable();
        await explorerManager.refresh();

        expect(factory).toHaveBeenCalledWith(fileItemMock, resolver);
        expect(fileItemMock.updateTitle).toHaveBeenCalled();
        expect(explorerLeafMock.isVisible).toHaveBeenCalled();
    });

    it("doUpdate should update the title of a specific file item", async () => {
        const explorerViewMock = mock<TFileExplorerView>();
        const explorerLeafMock = mock<TFileExplorerLeaf>({ view: explorerViewMock });
        explorerLeafMock.isVisible.mockReturnValue(true);
        const file = new TFile();
        const fileItemMOck = mock<TFileExplorerItem>();
        fileItemMOck.file = file;
        const secondFileItemMOck = mock<TFileExplorerItem>();
        secondFileItemMOck.file = file;
        const path = "test/path";
        explorerViewMock.fileItems = { [path]: fileItemMOck, "": secondFileItemMOck };
        facadeMock.getLeavesOfType.mockReturnValue([explorerLeafMock]);

        explorerManager.enable();
        const result = await explorerManager.update(path);

        expect(result).toBe(true);
        expect(factory).toHaveBeenCalledWith(fileItemMOck, resolver);
        expect(fileItemMOck.updateTitle).toHaveBeenCalled();
        expect(secondFileItemMOck.updateTitle).not.toHaveBeenCalled();
        expect(explorerLeafMock.isVisible).toHaveBeenCalled();
    });

    it("doUpdate should handle an undefined file item", async () => {
        const explorerLeafMock = mock<TFileExplorerLeaf>({ view: mock<TFileExplorerView>({ fileItems: {} }) });
        const path = "test/path";
        facadeMock.getLeavesOfType.mockReturnValue([explorerLeafMock]);
        explorerLeafMock.isVisible.mockReturnValue(false);

        explorerManager.enable();
        const result = await explorerManager.update(path);

        expect(result).toBe(false);
        expect(explorerLeafMock.isVisible).toHaveBeenCalled();
    });

    it("should handle the case when the explorer view is undefined", () => {
        facadeMock.getLeavesOfType.mockReturnValue([]);

        expect(() => {
            explorerManager.enable();
        }).toThrow(ExplorerViewUndefined);
    });

    // Coverage for exceptional cases
    it("should throw an exception if there is no explorer view", () => {
        facadeMock.getLeavesOfType.mockReturnValue([null]); // No view

        expect(() => {
            explorerManager.enable();
        }).toThrow(ExplorerViewUndefined);
    });

    // Testing the restoration of titles
    it("restoreTitles should restore titles for all modified items", () => {
        const fileItemMock = mock<TFileExplorerItem>();
        const explorerViewMock = mock<TFileExplorerView>();
        explorerViewMock.fileItems = { path: fileItemMock };
        const explorerLeafMock = mock<TFileExplorerLeaf>();
        explorerLeafMock.view = explorerViewMock;
        const mutatorMock = mock<ExplorerFileItemMutator>();

        explorerLeafMock.isVisible.mockReturnValue(true);
        facadeMock.getLeavesOfType.mockReturnValue([explorerLeafMock]);
        explorerManager.enable();

        // Simulating file modification
        explorerManager["modified"].set(fileItemMock, mutatorMock);

        explorerManager.disable(); // should trigger restoreTitles

        expect(mutatorMock.destroy).toHaveBeenCalled();
        expect(fileItemMock.updateTitle).toHaveBeenCalled();
        expect(explorerLeafMock.isVisible).toHaveBeenCalled();
    });
});
