import { mock } from "jest-mock-extended";
import { TFileExplorerItem, TFileExplorerView } from "obsidian";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ExplorerManager from "@src/Feature/Explorer/ExplorerManager";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";
import { ResolverInterface } from "@src/Resolver/Interfaces";

const path = "path/to/file.md";
const mockResolver = mock<ResolverInterface>();
const getFileItems = jest.fn(() => ({}));
//@ts-ignore
const viewMock: TFileExplorerView = {
    requestSort: jest.fn(() => {}),
    get fileItems() {
        return getFileItems() as any;
    },
} as TFileExplorerView;

const facade = mock<ObsidianFacade>();
facade.getLeavesOfType.mockReturnValue([]);

describe("Test enable exceptions", () => {
    const manager = new ExplorerManager(facade);
    manager.setResolver(mockResolver);
    test("Should throw error with undefined view", () => {
        facade.getLeavesOfType.mockReturnValueOnce([]);
        expect(() => manager.enable()).toThrow(ExplorerViewUndefined);
        //@ts-ignore
        facade.getLeavesOfType.mockReturnValueOnce([{}]);
        expect(() => manager.enable()).toThrow(ExplorerViewUndefined);
    });
    test("Should throw error because more than 1 leaf", () => {
        //@ts-ignore
        facade.getLeavesOfType.mockReturnValueOnce([{}, {}]);
        expect(() => manager.enable()).toThrow("There are some explorers' leaves");
    });
});

test("Should do nothing because it is not enabled", () => {
    const manager = new ExplorerManager(facade);
    manager.setResolver(mockResolver);
    expect(manager.update(path)).resolves.toBeFalsy();
    expect(mockResolver.resolve).not.toHaveBeenCalled();
});

describe("Test flow", () => {
    beforeEach(() => mockResolver.resolve.mockClear());
    const items = {
        "/path/first.md": {
            file: { path: "/path/first.md" },
            titleInnerEl: { innerText: "first" },
        } as TFileExplorerItem,
        "/path/second.md": {
            file: { path: "/path/second.md" },
            titleInnerEl: { innerText: "second" },
        } as TFileExplorerItem,
    };
    getFileItems.mockReturnValue(items);
    //@ts-ignore
    facade.getLeavesOfType.mockReturnValue([{ view: viewMock }]);
    const manager = new ExplorerManager(facade);
    manager.setResolver(mockResolver);
    test("Should be enabled", async () => {
        await manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    });

    test("Should not call resolver because explorer does not have files", async () => {
        getFileItems.mockReturnValueOnce({});
        expect(await manager.refresh()).toEqual({});
        expect(await manager.update(path)).toBeFalsy();
        expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    test("Should call resolver, but update nothing", async () => {
        for (const value of [null, undefined, ""]) {
            mockResolver.resolve.mockReturnValue(value);
            expect(await manager.refresh()).toEqual({
                "/path/first.md": false,
                "/path/second.md": false,
            });
        }
        expect(mockResolver.resolve).toHaveBeenCalledTimes(6);

        expect(items["/path/first.md"].titleInnerEl.innerText).toEqual("first");
        expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
    });

    describe("Should update and restore only first item", () => {
        const item = items["/path/first.md"];

        for (const v of ["first_resolved", "first_resolved_again"]) {
            test(`Should update only first item with "${v}" value`, async () => {
                mockResolver.resolve.mockReturnValueOnce(v);
                expect(await manager.update(item.file.path)).toBeTruthy();
                expect(item.titleInnerEl.innerText).toEqual(v);
                expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
                expect(mockResolver.resolve).toHaveBeenCalledWith(item.file.path);
                expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
                mockResolver.resolve.mockClear();
            });
        }
        test("Should restore first value", async () => {
            mockResolver.resolve.mockReturnValueOnce(null);
            expect(await manager.update(item.file.path)).toBeTruthy();
            expect(item.titleInnerEl.innerText).toEqual("first");
            expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
            expect(mockResolver.resolve).toHaveBeenCalledWith(item.file.path);
        });

        test("Should update and restore because of resolver reject", async () => {
            mockResolver.resolve.mockReturnValueOnce("first_reject" as any);
            expect(await manager.update(item.file.path)).toBeTruthy();
            expect(item.titleInnerEl.innerText).toEqual("first_reject");
            mockResolver.resolve.mockImplementationOnce(() => {
                throw new Error();
            });
            expect(await manager.update(item.file.path)).toBeTruthy();
            expect(item.titleInnerEl.innerText).toEqual("first");
        });
    });

    describe("Should update and restore all", () => {
        beforeEach(() => mockResolver.resolve.mockClear());
        test("Should update all", async () => {
            mockResolver.resolve.mockImplementation(v => `${v}_resolved`);
            expect(await manager.refresh()).toEqual({
                "/path/first.md": true,
                "/path/second.md": true,
            });
            for (const v of Object.values(items)) {
                expect(v.titleInnerEl.innerText).toEqual(`${v.file.path}_resolved`);
                expect(mockResolver.resolve).toHaveBeenCalledWith(v.file.path);
            }
            expect(mockResolver.resolve).toHaveBeenCalledTimes(2);
        });
        test("Should restore all", async () => {
            mockResolver.resolve.mockReturnValue(null);
            await manager.refresh();
            expect(items["/path/first.md"].titleInnerEl.innerText).toEqual("first");
            expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
            expect(mockResolver.resolve).toHaveBeenCalledTimes(2);
            expect(mockResolver.resolve).toHaveBeenCalledWith("/path/first.md");
            expect(mockResolver.resolve).toHaveBeenCalledWith("/path/second.md");
        });

        test("Should update and resolve by disabling", async () => {
            mockResolver.resolve.mockImplementation(() => Math.random().toString());
            await manager.refresh();
            expect(items["/path/first.md"].titleInnerEl.innerText).not.toEqual("first");
            expect(items["/path/second.md"].titleInnerEl.innerText).not.toEqual("second");
            await manager.disable();
            expect(items["/path/first.md"].titleInnerEl.innerText).toEqual("first");
            expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
        });
    });
});
