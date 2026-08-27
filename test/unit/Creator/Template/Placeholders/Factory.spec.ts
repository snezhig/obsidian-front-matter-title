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
        { placeholder: "#h1", type: AbstractPlaceholder.HEADING },
        { placeholder: "#h6", type: AbstractPlaceholder.HEADING },
        { placeholder: "foo|bar", type: AbstractPlaceholder.LOGIC },
        // Only #h1..#h6 are level tokens; anything else keeps its usual type.
        { placeholder: "#h7", type: AbstractPlaceholder.META },
        { placeholder: "#h0", type: AbstractPlaceholder.META },
        { placeholder: "#H1", type: AbstractPlaceholder.META },
        // A composite still goes to the logic placeholder, which splits it itself.
        { placeholder: "#h1|_basename", type: AbstractPlaceholder.LOGIC },
    ];

    for (const item of data) {
        test(`Test placeholder [${item.placeholder}] and type [${item.type}]`, () => {
            factory.create(item.placeholder);
            expect(resolver).toHaveBeenLastCalledWith(item.type, item.placeholder);
        });
    }
});
