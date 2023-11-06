import { TFileExplorerItem } from "obsidian";
import { mockDeep, MockProxy, mock } from "jest-mock-extended";
import { ExplorerFileItemMutator } from "../../../../src/Feature/Explorer/ExplorerFileItemMutator";
import { ResolverInterface } from "../../../../src/Resolver/Interfaces";

describe("ExplorerFileItemMutator", () => {
    let mockItem: MockProxy<TFileExplorerItem & TFileExplorerItem>;
    let mockResolver: MockProxy<ResolverInterface>;
    let mutator: ExplorerFileItemMutator;

    beforeEach(() => {
        mockItem = mock<TFileExplorerItem>();
        mockItem.innerEl = mock<HTMLDivElement>();
        mockResolver = mockDeep<ResolverInterface>();
        mutator = new ExplorerFileItemMutator(mockItem, mockResolver);
    });

    it("should override updateTitle method", () => {
        const originalUpdateTitle = mockItem.updateTitle;
        const title = "New Title";
        const path = "/test/path";
        mockItem.file.path = path;
        mockResolver.resolve.mockReturnValue(title);

        mutator["updateTitle"]();

        expect(mockResolver.resolve).toHaveBeenCalledWith(path);
        expect(originalUpdateTitle).toHaveBeenCalled();
        expect(mockItem.innerEl.setText).toHaveBeenCalledWith(title);
    });

    it("should override startRename method", () => {
        const originalStartRename = mockItem.startRename;
        const title = "Title for Rename";
        mockItem.getTitle.mockReturnValue(title);

        mutator["startRename"]();

        expect(mockItem.innerEl.setText).toHaveBeenCalledWith(title);
        expect(originalStartRename).toHaveBeenCalled();
    });

    it("should restore original methods on destroy", () => {
        mutator.destroy();

        expect(mockItem.updateTitle).toBe(mockItem.updateTitle);
        expect(mockItem.startRename).toBe(mockItem.startRename);
    });
});
