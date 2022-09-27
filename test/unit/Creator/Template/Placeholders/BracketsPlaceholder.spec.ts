import BracketsPlaceholder from "@src/Creator/Template/Placeholders/BracketsPlaceholder";
import { mock } from "jest-mock-extended";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";

describe("Brackets Placeholder Test", () => {
    const factory = mock<Factory>();
    const brackets = new BracketsPlaceholder(factory);
    const data = [{ placeholder: "{{_path}}", inside: "_path", value: Math.random().toString() }];

    for (const item of data) {
        const childMock = mock<TemplatePlaceholderInterface>();
        childMock.makeValue.mockReturnValue(item.value);
        factory.create.mockImplementationOnce((p: string) => {
            childMock.getPlaceholder.mockReturnValue(p);
            return childMock;
        });
        test(`Test template [${item.placeholder}] with inside [${item.inside}]`, () => {
            brackets.setPlaceholder(item.placeholder);
            expect(factory.create).toHaveBeenCalledWith(item.inside);
            expect(brackets.getPlaceholder()).toEqual(item.placeholder);

            expect(brackets.makeValue("/")).toEqual(item.value);
            expect(childMock.makeValue).toHaveBeenCalledWith("/");
        });
    }
});
