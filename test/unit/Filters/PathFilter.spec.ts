import { mock } from "jest-mock-extended";
import BlackWhiteListInterface from "../../../src/Components/BlackWhiteList/BlackWhiteListInterface";
import PathListFilter from "../../../src/Filters/PathListFilter";

describe("Path Filter Test", () => {
    const list = mock<BlackWhiteListInterface>();
    const filter = new PathListFilter(list);

    test("Will return false", () => {
        list.isFileAllowed.mockReturnValueOnce(false);
        expect(filter.check("/path/to/file")).toBeFalsy();
    });
    test("Will return true", () => {
        list.isFileAllowed.mockReturnValueOnce(true);
        expect(filter.check("/path/to/file")).toBeTruthy();
    });
});
