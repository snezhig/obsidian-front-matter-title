import HeadingPlaceholder from "@src/Creator/Template/Placeholders/HeadingPlaceholder";

const path = "/path/to/file.md";
const headings = [
    { level: 2, heading: "Second level first" },
    { level: 1, heading: "The H1" },
    { level: 3, heading: "Third level" },
    { level: 1, heading: "Another H1" },
];

describe("HeadingPlaceholder", () => {
    const factory = jest.fn();
    const create = (placeholder: string): HeadingPlaceholder =>
        new HeadingPlaceholder(factory).setPlaceholder(placeholder) as HeadingPlaceholder;

    beforeEach(() => {
        factory.mockReset();
        factory.mockReturnValue(headings);
    });

    test("#heading takes the first heading of any level", () => {
        expect(create("#heading").makeValue(path)).toEqual("Second level first");
        expect(factory).toHaveBeenCalledWith(path, "headings");
    });

    test("#h1 takes the first H1, not the first heading", () => {
        expect(create("#h1").makeValue(path)).toEqual("The H1");
    });

    test.each([
        ["#h2", "Second level first"],
        ["#h3", "Third level"],
    ])("%s takes the first heading of that level", (placeholder, expected) => {
        expect(create(placeholder).makeValue(path)).toEqual(expected);
    });

    test("returns empty when the requested level is absent, so the fallback applies", () => {
        expect(create("#h4").makeValue(path)).toEqual("");
        expect(create("#h5").makeValue(path)).toEqual("");
        expect(create("#h6").makeValue(path)).toEqual("");
    });

    test("returns empty for a note without headings", () => {
        factory.mockReturnValue([]);
        expect(create("#heading").makeValue(path)).toEqual("");
        expect(create("#h1").makeValue(path)).toEqual("");
    });

    test("returns empty when the cache has no headings at all", () => {
        factory.mockReturnValue(undefined);
        expect(create("#heading").makeValue(path)).toEqual("");
        expect(create("#h1").makeValue(path)).toEqual("");
    });
});
