import { mock } from "jest-mock-extended";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { EventRef, Events, Plugin, StarredPluginView } from "obsidian";
import { Feature } from "@src/enum";
import StarredManager from "@src/Feature/Starred/StarredManager";

const mockFacade = mock<ObsidianFacade>();
const mockResolver = mock<ResolverInterface<Resolving.Sync>>();
const path = "/path/to/file.md";
const manager = new StarredManager(mockFacade, mockResolver, mock<LoggerInterface>());

const plugin = mock<Plugin & Events>({ on: jest.fn(() => ref) });
const ref = mock<EventRef>();

test("Should return correct id", () => {
    expect(manager.getId()).toEqual(Feature.Starred);
});

test("Should not work because disabled", async () => {
    expect(manager.isEnabled()).toBeFalsy();
    expect(await manager.update(path)).toBeFalsy();
    expect(mockResolver.resolve).not.toHaveBeenCalled();
});

describe("Test enable when the dependencies are not exist", () => {
    afterEach(() => mockFacade.getViewsOfType.mockClear());
    test("Should not be enabled because there is no the leaf", () => {
        manager.enable();
        expect(manager.isEnabled()).toBeFalsy();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
        expect(mockFacade.getViewsOfType).toHaveBeenCalledWith("starred");
    });

    test("Should not be enabled because there is not the plugin in the view of the leaf", () => {
        mockFacade.getViewsOfType.mockReturnValueOnce([mock<StarredPluginView>({ plugin: null })]);
        manager.enable();

        expect(manager.isEnabled()).toBeFalsy();
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
        expect(mockFacade.getViewsOfType).toHaveBeenCalledWith("starred");
    });
});

describe("Test enabled state", () => {
    const view = mock<StarredPluginView>({ plugin });

    test("Should be enabled", () => {
        mockFacade.getViewsOfType.mockReturnValueOnce([view]);
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    });

    test("Should not call anything because it is already enabled", () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
        expect(plugin.on).toHaveBeenCalledWith("changed", expect.anything());
        expect(plugin.on).toHaveBeenCalledTimes(1);
        expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
        expect(mockFacade.getViewsOfType).toHaveBeenCalledWith("starred");
    });

    describe("Test Update", () => {
        const listEl = mock<Element>();
        const items = new WeakMap();
        view.listEl = listEl;
        view.itemLookup = items;

        test("Should change only file items with another title and restore one original", async () => {
            const contentBlocks = {
                fileFoo: mock<Element>({ getText: () => "foo-file" }),
                fileBar: mock<Element>({ getText: () => "bar-file" }),
                searchUou: mock<Element>({ getText: () => "uou-search" }),
                fileSnork: mock<Element>({ getText: () => "snork-resolved" }),
            };
            const navBlocks = {
                foo: mock<Element>({
                    find: (selector: string) => (selector === ".nav-file-title-content" ? contentBlocks.fileFoo : null),
                }),
                bar: mock<Element>({
                    find: (selector: string) => (selector === ".nav-file-title-content" ? contentBlocks.fileBar : null),
                }),
                uou: mock<Element>({
                    find: (selector: string) =>
                        selector === ".nav-file-title-content" ? contentBlocks.searchUou : null,
                }),
                snork: mock<Element>({
                    find: (selector: string) =>
                        selector === ".nav-file-title-content" ? contentBlocks.fileSnork : null,
                }),
            };
            items
                .set(navBlocks.foo, { type: "file", path: "foo.md", title: "foo-file" })
                .set(navBlocks.bar, { type: "file", path: "bar.md", title: "bar-file" })
                .set(navBlocks.uou, { type: "search", path: "uou.md", title: "uou-search" })
                .set(navBlocks.snork, { type: "file", path: "snork.md", title: "snork-file" });

            //@ts-ignore
            listEl.findAll.mockImplementationOnce((selector: string) => {
                if (selector === ".nav-file") {
                    return Object.values(navBlocks);
                }
                return [];
            });

            mockResolver.resolve.mockImplementation((path: string) => {
                const name = path.replace(".md", "");
                switch (name) {
                    case "bar":
                        return "bar-file";
                    case "snork":
                        return null;
                    default:
                        return `${name}-resolved`;
                }
            });

            await manager.refresh();

            expect(contentBlocks.fileFoo.setText).toHaveBeenCalledTimes(1);
            expect(contentBlocks.fileFoo.setText).toHaveBeenCalledWith("foo-resolved");

            expect(contentBlocks.fileSnork.setText).toHaveBeenCalledTimes(1);
            expect(contentBlocks.fileSnork.setText).toHaveBeenCalledWith("snork-file");

            expect(contentBlocks.fileBar.setText).not.toHaveBeenCalled();
            expect(contentBlocks.searchUou.setText).not.toHaveBeenCalled();
        });
    });
});

describe("Test disabled state", () => {
    test("Should be disabled", () => {
        manager.disable();
        expect(manager.isEnabled()).toBeFalsy();
    });
    test("Should unsubscribe ref and trigger event to restore default", () => {
        expect(plugin.offref).toHaveBeenCalledTimes(1);
        expect(plugin.offref).toHaveBeenCalledWith(ref);
        expect(plugin.trigger).toHaveBeenCalledTimes(1);
        expect(plugin.trigger).toHaveBeenCalledWith("changed");
    });
});
