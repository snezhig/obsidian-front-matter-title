import { Mode } from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import BlackWhiteList from "@src/Components/BlackWhiteList/BlackWhiteList";

describe("Test without list", () => {
    test("Should return true by default", () => {
        const list = new BlackWhiteList();
        expect(list.isFileAllowed("path")).toBeTruthy();
    });
    test("Should return true with black mode", () => {
        const list = new BlackWhiteList();
        list.setMode("black");
        expect(list.isFileAllowed("path")).toBeTruthy();
    });
    test("Should return true with white mode", () => {
        const list = new BlackWhiteList();
        list.setMode("white");
        expect(list.isFileAllowed("path")).toBeTruthy();
    });
});

describe("Black-White List test", () => {
    const path = ["foo", "bar/subbar"];
    const items: { path: string; mode: Mode; expected: boolean }[] = [
        { path: "foo/test.md", mode: "black", expected: false },
        { path: "foo/subfoo/test.md", mode: "black", expected: false },
        { path: "bar/subbar/test.md", mode: "black", expected: false },
        { path: "bar/subfoobar/test.md", mode: "black", expected: true },
        { path: "test.md", mode: "black", expected: true },

        { path: "foo/test.md", mode: "white", expected: true },
        { path: "foo/subfoo/test.md", mode: "white", expected: true },
        { path: "bar/subbar/test.md", mode: "white", expected: true },
        { path: "bar/subfoobar/test.md", mode: "white", expected: false },
        { path: "test.md", mode: "white", expected: false },
    ];
    const list = new BlackWhiteList();
    list.setList(path);
    for (const item of items) {
        test(`Path "${item.path}" is expected to be ${item.expected.toString()} [${item.mode} mode]`, () => {
            list.setMode(item.mode);
            expect(list.isFileAllowed(item.path)).toBe(item.expected);
        });
    }
});
