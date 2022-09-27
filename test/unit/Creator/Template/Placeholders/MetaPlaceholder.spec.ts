import MetaPlaceholder from "@src/Creator/Template/Placeholders/MetaPlaceholder";
import { mock } from "jest-mock-extended";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";

describe("Meta Placeholder Test", () => {
    const placeholder = "foobar";
    const expected = "barfoo";
    const path = "/path/to/file.md";
    const extractor = mock<ExtractorInterface>();
    extractor.extract.mockReturnValue(expected);
    const meta: { [k: string]: any } = {};
    const metaFactory = jest.fn((path: string, type: string) => meta);
    const metaPlaceholder = new MetaPlaceholder(extractor, metaFactory);

    test("Set and get placeholder", () => {
        metaPlaceholder.setPlaceholder(placeholder);
        expect(metaPlaceholder.getPlaceholder()).toEqual(placeholder);
    });

    test(`Placeholder will return "${expected}"`, () => {
        const actual = metaPlaceholder.makeValue(path);
        expect(actual).toEqual(expected);
    });

    test("Dependencies have been called", () => {
        expect(metaFactory).toHaveBeenCalledWith(path, "frontmatter");
        expect(extractor.extract).toHaveBeenCalledWith(placeholder, meta);
    });
});
