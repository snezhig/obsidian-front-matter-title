import ExtensionFilter from "../../../src/Filters/ExtensionFilter";

describe("Extension Filter Test", () => {
    const data: { [k: string]: string } = {
        md: "/path/to/file/file.md",
        exe: "/path/to/file/file.exe",
        png: "/path/to/file/file.png",
        pdf: "/path/to/file/file.pdf",
    };
    for (const [k, v] of Object.entries(data)) {
        test(`Test extension [${k}]`, () => {
            expect(new ExtensionFilter().check(v)).toEqual(k === "md");
        });
    }
});
