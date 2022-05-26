import Manager from "../../../../src/Title/Manager/Manager";
import MarkdownManager from "../../../../src/Title/Manager/MarkdownManager";
import {MarkdownViewExt, TFile, Workspace} from "obsidian";

let manager: Manager = new MarkdownManager();
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
    foo: {innerText: jest.spyOn<HTMLDivElement, any>(views.foo.titleEl, 'innerText', 'get')},
    bar: {innerText: jest.spyOn<HTMLDivElement, any>(views.bar.titleEl, 'innerText', 'get')},
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

    })
})