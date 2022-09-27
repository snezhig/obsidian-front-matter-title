import Factory from "@src/Creator/Template/Placeholders/Factory";
import { mock } from "jest-mock-extended";
import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";

describe("Factory Test", () => {
    const resolver = jest.fn((type: string, placeholder: string) => mock<TemplatePlaceholderInterface>());
    const factory = new Factory(resolver);
    beforeEach(() => resolver.mockClear());
    const data = [
        { placeholder: "foobar", type: "meta" },
        { placeholder: "{{foo bar}}", type: "brackets" },
        { placeholder: "_foo bar", type: "file" },
    ];

    for (const item of data) {
        test(`Test placeholder [${item.placeholder}] and type [${item.type}]`, () => {
            factory.create(item.placeholder);
            expect(resolver).toHaveBeenLastCalledWith(item.type, item.placeholder);
        });
    }
});
