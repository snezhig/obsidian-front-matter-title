import Manager from "../../../../src/Title/Manager/Manager";
import MarkdownManager from "../../../../src/Title/Manager/MarkdownManager";
import { MarkdownViewExt, TFile, Workspace, WorkspaceLeaf } from "obsidian";
import Resolver from "../../../../src/Title/Resolver/Resolver";

const workspace = new Workspace();
let manager: Manager = new MarkdownManager(workspace, Object.create(Resolver.prototype));
const createView = (name: string) => {
    const titleEl = new (class {
        constructor(private text: string) {}

        set innerText(v: string) {
            this.text = v;
        }

        get innerText(): string {
            return this.text;
        }

        addEventListener = jest.fn();
        removeEventListener = jest.fn();
    })(name) as unknown as HTMLDivElement;

    const file = new TFile();
    file.path = `${name}.md`;

    return { titleEl, file } as unknown as MarkdownViewExt;
};

const views: { [k: string]: MarkdownViewExt } = {
    foo: createView("foo"),
    bar: createView("bar"),
};
const mocks = {
    foo: { innerText: jest.spyOn<HTMLDivElement, any>(views.foo.titleEl, "innerText", "set") },
    bar: { innerText: jest.spyOn<HTMLDivElement, any>(views.bar.titleEl, "innerText", "set") },
    resolver: {
        resolve: jest.spyOn<Resolver, "resolve">(Resolver.prototype, "resolve"),
    },
    workspace: {
        getLeavesOfType: jest.spyOn<Workspace, "getLeavesOfType">(Workspace.prototype, "getLeavesOfType"),
    },
};

describe("Markdown leaf test", () => {
    const enable = () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    };

    const disable = () => {
        manager.disable();
        expect(manager.isEnabled()).toBeFalsy();
    };

    describe("Plugin without exist leaves", () => {
        test("Plugin has been enabled", () => enable());
        test("Plugin has been disabled", () => disable());

        test("Foo and Bar have not been called", () => {
            expect(mocks.foo.innerText).not.toHaveBeenCalled();
            expect(mocks.bar.innerText).not.toHaveBeenCalled();
        });
    });

    describe("Plugin with leaves", () => {
        describe("Test Foo view", () => {
            const title = "new-foo-title";
            const origin = "foo";
            beforeAll(() => {
                mocks.workspace.getLeavesOfType.mockReturnValue([{ view: views.foo } as unknown as WorkspaceLeaf]);
                mocks.resolver.resolve.mockResolvedValue(title);
            });
            beforeEach(() => {
                mocks.foo.innerText.mockClear();
                mocks.resolver.resolve.mockClear();
            });
            afterEach(() => {
                views.foo.titleEl.innerText = origin;
            });

            test("Enable", () => enable());

            test("Has been changed", async () => {
                await manager.update();
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, title);
            });

            test("Has not been changed", async () => {
                await manager.update(views.bar.file);
                expect(mocks.foo.innerText).not.toHaveBeenCalled();
            });

            test("Has been restores because of null", async () => {
                mocks.resolver.resolve.mockResolvedValueOnce(null);
                await manager.update();
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, origin);
            });

            test("Has been changed and restored because of disable", async () => {
                await manager.update();
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, title);
                disable();
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(2, origin);
                expect(mocks.foo.innerText).toHaveBeenCalledTimes(2);
            });

            test("Has not been updated because of disable", async () => {
                disable();
                await manager.update();
                expect(mocks.resolver.resolve).not.toHaveBeenCalled();
                expect(mocks.foo.innerText).not.toHaveBeenCalled();
            });

            test("Has been updated by event", async () => {
                enable();
                let resolved: boolean = false;
                mocks.resolver.resolve.mockImplementationOnce(async () => {
                    resolved = true;
                    return title;
                });
                workspace.trigger("layout-change");
                await new Promise<void>(r =>
                    setTimeout(() => {
                        if (resolved) r();
                    }, 1)
                );
                expect(mocks.resolver.resolve).toHaveBeenCalledTimes(1);
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, title);
            });

            test("Has not been updated twice", async () => {
                enable();
                await manager.update();
                await manager.update();

                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, title);
                expect(mocks.foo.innerText).toHaveBeenCalledTimes(1);
            });

            afterAll(() => {
                mocks.workspace.getLeavesOfType.mockReset();
                mocks.resolver.resolve.mockReset();
            });
        });
    });
});
