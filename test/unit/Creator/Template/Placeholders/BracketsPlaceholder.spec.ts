import BracketsPlaceholder from "@src/Creator/Template/Placeholders/BracketsPlaceholder";
import { mock } from "jest-mock-extended";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import { TemplatePlaceholderInterface } from "@src/Creator/Interfaces";

describe("Brackets Placeholder Test", () => {
    const data = [
        { placeholder: "{{_path}}", inside: "_path", childValue: "foo", expectedValue: "foo" },
        { placeholder: "{{ key}}", inside: "key", childValue: "bar", expectedValue: " bar" },
        { placeholder: "{{key }}", inside: "key", childValue: "baz", expectedValue: "baz " },
        { placeholder: "{{ composite key }}", inside: "composite key", childValue: "quo", expectedValue: " quo " },
        { placeholder: "{{ composite key }}", inside: "composite key", childValue: "", expectedValue: null },
        // non-ASCII (CJK) keys — used to break because of the ASCII-only \b (#256)
        { placeholder: "{{完稿}}", inside: "完稿", childValue: "稿件", expectedValue: "稿件" },
        { placeholder: "{{ 完稿 }}", inside: "完稿", childValue: "x", expectedValue: " x " },
    ];

    for (const item of data) {
        const factory = mock<Factory>();
        const brackets = new BracketsPlaceholder(factory);
        const childMock = mock<TemplatePlaceholderInterface>();
        childMock.makeValue.mockReturnValue(item.childValue);
        factory.create.mockImplementationOnce((p: string) => {
            childMock.getPlaceholder.mockReturnValue(p);
            return childMock;
        });
        test(`Test template [${item.placeholder}] with inside [${item.inside}]`, () => {
            brackets.setPlaceholder(item.placeholder);
            expect(factory.create).toHaveBeenCalledWith(item.inside);
            expect(brackets.getPlaceholder()).toEqual(item.placeholder);

            expect(brackets.makeValue("/")).toEqual(item.expectedValue);
            expect(childMock.makeValue).toHaveBeenCalledWith("/");
        });
    }
});
