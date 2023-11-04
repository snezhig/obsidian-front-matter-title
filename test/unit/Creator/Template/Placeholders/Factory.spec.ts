import Factory from "@src/Creator/Template/Placeholders/Factory";
import { mock } from "jest-mock-extended";
import { TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import AbstractPlaceholder from "../../../../../src/Creator/Template/Placeholders/AbstractPlaceholder";

describe("Factory Test", () => {
    const resolver = jest.fn((type: string, placeholder: string) => mock<TemplatePlaceholderInterface>());
    const factory = new Factory(resolver);
    beforeEach(() => resolver.mockClear());
    const data = [
        { placeholder: "foobar", type: AbstractPlaceholder.META },
        { placeholder: "{{foo bar}}", type: AbstractPlaceholder.BRACKETS },
        { placeholder: "_foo bar", type: AbstractPlaceholder.FILE },
        { placeholder: "#heading", type: AbstractPlaceholder.HEADING },
        { placeholder: "foo|bar", type: AbstractPlaceholder.LOGIC },
    ];

    for (const item of data) {
        test(`Test placeholder [${item.placeholder}] and type [${item.type}]`, () => {
            factory.create(item.placeholder);
            expect(resolver).toHaveBeenLastCalledWith(item.type, item.placeholder);
        });
    }
});
