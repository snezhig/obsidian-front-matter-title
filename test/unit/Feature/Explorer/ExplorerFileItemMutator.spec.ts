import { TFileExplorerItem } from "obsidian";
import { mockDeep, MockProxy, mock } from "jest-mock-extended";
import { ExplorerFileItemMutator } from "@src/Feature/Explorer/ExplorerFileItemMutator";
import { ResolverInterface } from "@src/Resolver/Interfaces";

describe("ExplorerFileItemMutator", () => {
    let itemProto: Partial<TFileExplorerItem>;
    let mockItem: MockProxy<TFileExplorerItem>;
    let mockResolver: MockProxy<ResolverInterface>;
    let mutator: ExplorerFileItemMutator;

    beforeEach(() => {
        mockItem = mock<TFileExplorerItem>();
        mockItem.innerEl = mock<HTMLDivElement>();
        itemProto = {
            startRename: jest.fn(),
            updateTitle: jest.fn(),
        };
        Object.setPrototypeOf(mockItem, itemProto);

        mockResolver = mockDeep<ResolverInterface>();
        mutator = new ExplorerFileItemMutator(mockItem, mockResolver);
    });

    it("should override methods", () => {
        expect(mockItem.updateTitle).not.toBe(itemProto.updateTitle);
        expect(mockItem.startRename).not.toBe(itemProto.startRename);
    });

    it("should override updateTitle method", () => {
        const title = "New Title";
        const path = "/test/path";
        mockItem.file.path = path;
        mockResolver.resolve.mockReturnValue(title);

        mockItem.updateTitle();

        expect(mockResolver.resolve).toHaveBeenCalledWith(path);
        expect(itemProto.updateTitle).toHaveBeenCalled();
        expect(mockItem.innerEl.setText).toHaveBeenCalledWith(title);
    });

    it("should override startRename method", () => {
        const title = "Title for Rename";
        mockItem.getTitle.mockReturnValue(title);

        mockItem.startRename();

        expect(mockItem.innerEl.setText).toHaveBeenCalledWith(title);
        expect(itemProto.startRename).toHaveBeenCalled();
    });

    it("should restore original methods on destroy", () => {
        mutator.destroy();

        expect(mockItem.updateTitle).toBe(itemProto.updateTitle);
        expect(mockItem.startRename).toBe(itemProto.startRename);
    });
});
