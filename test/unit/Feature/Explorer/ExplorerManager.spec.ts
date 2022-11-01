import { mock } from "jest-mock-extended";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import { TFileExplorerItem, TFileExplorerView } from "obsidian";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ExplorerManager from "@src/Feature/Explorer/ExplorerManager";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";

const path = "path/to/file.md";
const resolverMock = mock<ResolverInterface<Resolving.Async>>();
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
    const manager = new ExplorerManager(resolverMock, facade);
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
    const manager = new ExplorerManager(resolverMock, facade);
    expect(manager.update(path)).resolves.toBeFalsy();
    expect(resolverMock.resolve).not.toHaveBeenCalled();
});

describe("Test flow", () => {
    beforeEach(() => resolverMock.resolve.mockClear());
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
    const manager = new ExplorerManager(resolverMock, facade);
    test("Should be enabled", async () => {
        await manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    });

    test("Should not call resolver because explorer does not have files", async () => {
        getFileItems.mockReturnValueOnce({});
        expect(await manager.refresh()).toEqual({});
        expect(await manager.update(path)).toBeFalsy();
        expect(resolverMock.resolve).not.toHaveBeenCalled();
    });

    test("Should call resolver, but update nothing", async () => {
        for (const value of [null, undefined, ""]) {
            resolverMock.resolve.mockResolvedValue(value as any);
            expect(await manager.refresh()).toEqual({
                "/path/first.md": false,
                "/path/second.md": false,
            });
        }
        expect(resolverMock.resolve).toHaveBeenCalledTimes(6);

        expect(items["/path/first.md"].titleInnerEl.innerText).toEqual("first");
        expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
    });

    describe("Should update and restore only first item", () => {
        const item = items["/path/first.md"];

        for (const v of ["first_resolved", "first_resolved_again"]) {
            test(`Should update only first item with "${v}" value`, async () => {
                resolverMock.resolve.mockResolvedValueOnce(v as any);
                expect(await manager.update(item.file.path)).toBeTruthy();
                expect(item.titleInnerEl.innerText).toEqual(v);
                expect(resolverMock.resolve).toHaveBeenCalledTimes(1);
                expect(resolverMock.resolve).toHaveBeenCalledWith(item.file.path);
                expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
                resolverMock.resolve.mockClear();
            });
        }
        test("Should restore first value", async () => {
            resolverMock.resolve.mockResolvedValueOnce(null);
            expect(await manager.update(item.file.path)).toBeTruthy();
            expect(item.titleInnerEl.innerText).toEqual("first");
            expect(resolverMock.resolve).toHaveBeenCalledTimes(1);
            expect(resolverMock.resolve).toHaveBeenCalledWith(item.file.path);
        });

        test("Should update and restore because of resolver reject", async () => {
            resolverMock.resolve.mockResolvedValueOnce("first_reject" as any);
            expect(await manager.update(item.file.path)).toBeTruthy();
            expect(item.titleInnerEl.innerText).toEqual("first_reject");
            resolverMock.resolve.mockRejectedValueOnce(new Error() as any);
            expect(await manager.update(item.file.path)).toBeTruthy();
            expect(item.titleInnerEl.innerText).toEqual("first");
        });
    });

    describe("Should update and restore all", () => {
        beforeEach(() => resolverMock.resolve.mockClear());
        test("Should update all", async () => {
            resolverMock.resolve.mockImplementation(async v => `${v}_resolved`);
            expect(await manager.refresh()).toEqual({
                "/path/first.md": true,
                "/path/second.md": true,
            });
            for (const v of Object.values(items)) {
                expect(v.titleInnerEl.innerText).toEqual(`${v.file.path}_resolved`);
                expect(resolverMock.resolve).toHaveBeenCalledWith(v.file.path);
            }
            expect(resolverMock.resolve).toHaveBeenCalledTimes(2);
        });
        test("Should restore all", async () => {
            resolverMock.resolve.mockResolvedValue(null);
            await manager.refresh();
            expect(items["/path/first.md"].titleInnerEl.innerText).toEqual("first");
            expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
            expect(resolverMock.resolve).toHaveBeenCalledTimes(2);
            expect(resolverMock.resolve).toHaveBeenCalledWith("/path/first.md");
            expect(resolverMock.resolve).toHaveBeenCalledWith("/path/second.md");
        });

        test("Should update and resolve by disabling", async () => {
            resolverMock.resolve.mockImplementation(async () => Math.random().toString());
            await manager.refresh();
            expect(items["/path/first.md"].titleInnerEl.innerText).not.toEqual("first");
            expect(items["/path/second.md"].titleInnerEl.innerText).not.toEqual("second");
            await manager.disable();
            expect(items["/path/first.md"].titleInnerEl.innerText).toEqual("first");
            expect(items["/path/second.md"].titleInnerEl.innerText).toEqual("second");
        });
    });
});
