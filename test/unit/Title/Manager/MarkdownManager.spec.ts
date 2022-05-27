import Manager from "../../../../src/Title/Manager/Manager";
import MarkdownManager from "../../../../src/Title/Manager/MarkdownManager";
import {MarkdownViewExt, TFile, Workspace, WorkspaceLeaf} from "obsidian";
import Resolver from "../../../../src/Title/Resolver/Resolver"

let manager: Manager = new MarkdownManager(
    Object.create(Workspace.prototype),
    Object.create(Resolver.prototype)
);
const createView = (name: string) => {
    const titleEl = new class {
        constructor(private text: string) {
        }

        set innerText(v: string) {
            this.text = v;
        }

        get innerText(): string {
            return this.text;
        }
    }(name) as unknown as HTMLDivElement;

    const file = new TFile();
    file.path = `${name}.md`

    return {titleEl, file} as unknown as MarkdownViewExt;

};

const views: { [k: string]: MarkdownViewExt } = {
    foo: createView('foo'),
    bar: createView('bar'),
}
const mocks = {
    foo: {innerText: jest.spyOn<HTMLDivElement, any>(views.foo.titleEl, 'innerText', 'set')},
    bar: {innerText: jest.spyOn<HTMLDivElement, any>(views.bar.titleEl, 'innerText', 'set')},
    resolver: {
        resolve: jest.spyOn<Resolver, 'resolve'>(Resolver.prototype, 'resolve')
    },
    workspace: {
        getLeavesOfType: jest.spyOn<Workspace, 'getLeavesOfType'>(Workspace.prototype, 'getLeavesOfType')
    }
}

describe('Markdown leaf test', () => {
    describe('Plugin without exist leaves', () => {
        test('Plugin has been enabled', () => {
            manager.enable();
            expect(manager.isEnabled()).toBeTruthy();
        })
        test('Plugin has been disabled', () => {
            manager.disable();
            expect(manager.isEnabled()).toBeFalsy();
        })
        test('Foo and Bar have not been called', () => {
            expect(mocks.foo.innerText).not.toHaveBeenCalled();
            expect(mocks.bar.innerText).not.toHaveBeenCalled();
        })
    });

    describe('Plugin with leaves', () => {
        beforeAll(() => {
            manager.enable();
        })
        describe('Test Foo view', () => {
            beforeAll(() => {
                mocks.workspace.getLeavesOfType.mockReturnValue([{view: views.foo} as unknown as WorkspaceLeaf]);
            })
            beforeEach(() => {
                mocks.foo.innerText.mockClear();
            })
            test('Has been changed', async () => {
                const title = 'new_title';
                mocks.resolver.resolve.mockResolvedValueOnce(title);
                await manager.update();
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, title);
            })

            test('Has not been changed', async () => {
                await manager.update(views.bar.file);
                expect(mocks.foo.innerText).not.toHaveBeenCalled();
            })

            test('Has been restores because of null', async () => {
                mocks.resolver.resolve.mockResolvedValueOnce(null);
                await manager.update()
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, 'foo');
            })

            test('Has been changed and restored because of disable', async () => {
                const title = 'test';
                mocks.resolver.resolve.mockResolvedValueOnce(title);
                await manager.update();
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(1, title);
                manager.disable();
                expect(mocks.foo.innerText).toHaveBeenNthCalledWith(2, 'foo');
                expect(mocks.foo.innerText).toHaveBeenCalledTimes(2);
            })

            afterAll(() => {
                mocks.workspace.getLeavesOfType.mockReset();
            })
        })
    })
})