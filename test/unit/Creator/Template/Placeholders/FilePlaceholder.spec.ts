import FilePlaceholder from "@src/Creator/Template/Placeholders/FilePlaceholder";
import { mock } from "jest-mock-extended";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";

const obj = { test: "test" };
const factory = jest.fn((path: string) => obj);
const placeholder = "_basename";
const mockExtractor = mock<ExtractorInterface>();
const filePlaceholder = new FilePlaceholder(mockExtractor, factory);

describe("Test Placeholder", () => {
    test(`Should save "${placeholder}" placeholder`, () => {
        filePlaceholder.setPlaceholder(placeholder);
        expect(filePlaceholder.getPlaceholder()).toEqual(placeholder);
    });

    describe("Test makeValue()", () => {
        const path = "/path/to/file.md";
        const expected = "expected_value";
        mockExtractor.extract.mockReturnValueOnce(expected);

        test(`Should return ${expected} value`, () => {
            const value = filePlaceholder.makeValue(path);
            expect(value).toEqual(value);
        });
        test(`Should call factory with file type and ${path} path`, () => {
            expect(factory).toHaveBeenCalledTimes(1);
            expect(factory).toHaveBeenCalledWith(path);
        });
        test("Should call extractor with basename placeholder and object", () => {
            expect(mockExtractor.extract).toHaveBeenCalledTimes(1);
            expect(mockExtractor.extract).toHaveBeenCalledWith("basename", obj);
        });
    });
});
