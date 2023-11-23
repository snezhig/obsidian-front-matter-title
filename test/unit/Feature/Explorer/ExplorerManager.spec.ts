import { mock, mockDeep, mockReset } from "jest-mock-extended";
import { TFile, TFileExplorerItem, TFileExplorerView } from "obsidian";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { ExplorerFileItemMutator } from "@src/Feature/Explorer/ExplorerFileItemMutator";
import ExplorerManager from "../../../../src/Feature/Explorer/ExplorerManager";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import ExplorerViewUndefined from "../../../../src/Feature/Explorer/ExplorerViewUndefined";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";

// Mock dependencies
const mockedFacade = mock<ObsidianFacade>();
const factory = jest.fn();
const resolver = mock<ResolverInterface>();

// Mock methods and properties that will be used in the tests
mockedFacade.getLeavesOfType.mockReturnValue([]);
factory.mockImplementation(item => mock<ExplorerFileItemMutator>());

describe("ExplorerManager", () => {
    let explorerManager: ExplorerManager;
    let explorerSort: ExplorerSort;

    beforeEach(() => {
        // Reset all mocks before each test
        mockReset(mockedFacade);
        mockReset(resolver);
        factory.mockClear();

        // Create an instance of the class to be tested
        explorerSort = mock<ExplorerSort>();
        explorerManager = new ExplorerManager(mockedFacade, factory, explorerSort);
        explorerManager.setResolver(resolver);
    });

    it("should start the explorer feature", () => {
        // Assume that the method getLeavesOfType returns a non-empty array
        mockedFacade.getViewsOfType.mockReturnValue([mock<TFileExplorerView>()]);

        explorerManager.enable();

        expect(explorerManager.isEnabled()).toBe(true);
    });

    it("should throw an error if multiple explorer views are found", () => {
        mockedFacade.getViewsOfType.mockReturnValue([mockDeep<TFileExplorerView>(), mockDeep<TFileExplorerView>()]);

        expect(() => {
            explorerManager.enable();
        }).toThrow("There are some explorers' leaves");
    });

    it("should stop the explorer feature", () => {
        mockedFacade.getViewsOfType.mockReturnValue([mockDeep<TFileExplorerView>()]);
        explorerManager.enable();
        explorerManager.disable();

        expect(explorerManager.isEnabled()).toBe(false);
    });

    it("doRefresh should update titles of all file items", async () => {
        const mockExplorerView = mock<TFileExplorerView>();
        const mockFileItem = mock<TFileExplorerItem>();
        mockFileItem.file = new TFile();
        mockExplorerView.fileItems = { path: mockFileItem };
        mockedFacade.getViewsOfType.mockReturnValue([mockExplorerView]);

        explorerManager.enable();
        await explorerManager.refresh();

        expect(factory).toHaveBeenCalledWith(mockFileItem, resolver);
        expect(mockFileItem.updateTitle).toHaveBeenCalled();
    });

    it("doUpdate should update the title of a specific file item", async () => {
        const mockExplorerView = mock<TFileExplorerView>();
        const file = new TFile();
        const mockFileItem = mock<TFileExplorerItem>();
        mockFileItem.file = file;
        const mockSecondFileItem = mock<TFileExplorerItem>();
        mockSecondFileItem.file = file;
        const path = "test/path";
        mockExplorerView.fileItems = { [path]: mockFileItem, "": mockSecondFileItem };
        mockedFacade.getViewsOfType.mockReturnValue([mockExplorerView]);

        explorerManager.enable();
        const result = await explorerManager.update(path);

        expect(result).toBe(true);
        expect(factory).toHaveBeenCalledWith(mockFileItem, resolver);
        expect(mockFileItem.updateTitle).toHaveBeenCalled();
        expect(mockSecondFileItem.updateTitle).not.toHaveBeenCalled();
    });

    it("doUpdate should handle an undefined file item", async () => {
        const mockExplorerView = mock<TFileExplorerView>();
        const path = "test/path";
        mockExplorerView.fileItems = {};
        mockedFacade.getViewsOfType.mockReturnValue([mockExplorerView]);

        explorerManager.enable();
        const result = await explorerManager.update(path);

        expect(result).toBe(false);
    });

    it("should handle the case when the explorer view is undefined", () => {
        mockedFacade.getViewsOfType.mockReturnValue([]);

        expect(() => {
            explorerManager.enable();
        }).toThrow(ExplorerViewUndefined);
    });

    // Coverage for exceptional cases
    it("should throw an exception if there is no explorer view", () => {
        mockedFacade.getViewsOfType.mockReturnValue([null]); // No view

        expect(() => {
            explorerManager.enable();
        }).toThrow(ExplorerViewUndefined);
    });

    // Testing the restoration of titles
    it("restoreTitles should restore titles for all modified items", () => {
        const mockExplorerView = mock<TFileExplorerView>();
        const mockFileItem = mock<TFileExplorerItem>();
        const mockMutator = mock<ExplorerFileItemMutator>();

        mockExplorerView.fileItems = { path: mockFileItem };
        mockedFacade.getViewsOfType.mockReturnValue([mockExplorerView]);
        explorerManager.enable();

        // Simulating file modification
        explorerManager["modified"].set(mockFileItem, mockMutator);

        explorerManager.disable(); // should trigger restoreTitles

        expect(mockMutator.destroy).toHaveBeenCalled();
        expect(mockFileItem.updateTitle).toHaveBeenCalled();
    });
});
