import SuggestFeature from "@src/Feature/Suggest/SuggestFeature";
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import { mock } from "jest-mock-extended";
import { App, SuggestModal, SuggestModalChooser } from "obsidian";

SuggestModal.prototype.open = jest.fn();

const mockChooser = new (class extends SuggestModalChooser<any> {
    setSuggestions(e: any) {
        return e;
    }
})();
const modal = new (class extends SuggestModal<any> {
    chooser = mockChooser;
    getSuggestions(query: string): any[] | Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    renderSuggestion(value: any, el: HTMLElement) {
        throw new Error("Method not implemented.");
    }
    onChooseSuggestion(item: any, evt: MouseEvent | KeyboardEvent) {
        throw new Error("Method not implemented.");
    }
})(mock<App>());
console.log(modal);
const mockResolver = mock<ResolverInterface>();
const feature = new SuggestFeature(mockResolver);

test("", () => {
    feature.enable();
    modal.open();
    mockResolver.resolve.mockReturnValueOnce("foo");
    const item: { [k: string]: any } = { type: "file", file: { path: "path/to/file.md" } };
    mockChooser.setSuggestions([item]);
    expect(item.type).toEqual("alias");
    expect(item.alias).toEqual("foo");
    expect(mockResolver.resolve).toHaveBeenCalled();
});
