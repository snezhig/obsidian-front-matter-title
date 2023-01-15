import { mock } from "jest-mock-extended";
import { ValidatorAuto, ValidatorRequired } from "../../../../src/Feature/Alias/Validator";
import { CachedMetadata, FrontMatterCache } from "obsidian";

describe("Test Required Validator", () => {
    const validator = new ValidatorRequired();
    test("Should return false because frontmatter is null", () => {
        const cache = mock<CachedMetadata>({ frontmatter: null });
        expect(validator.validate(cache)).toBeFalsy();
    });
    test("Should return false because frontmatter is undefined", () => {
        const cache = mock<CachedMetadata>({ frontmatter: undefined });
        expect(validator.validate(cache)).toBeFalsy();
    });
    test("Should return false because frontmatter is not exist", () => {
        const cache = {} as CachedMetadata;
        expect(validator.validate(cache)).toBeFalsy();
    });
    test("Should return true", () => {
        const cache = mock<CachedMetadata>();
        expect(validator.validate(cache)).toBeTruthy();
    });
});

describe("Test Auto Validator", () => {
    const validator = new ValidatorAuto();
    const empty: FrontMatterCache = {
        position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } },
    };
    test("Should create empty frontmatter", () => {
        const cache = {} as CachedMetadata;
        expect(validator.validate(cache)).toBeTruthy();
        expect(cache).toHaveProperty("frontmatter", empty);
    });

    test("Should not affect on frontmatter", () => {
        const cache = { frontmatter: {} } as CachedMetadata;
        expect(validator.validate(cache)).toBeTruthy();
        expect(cache).toHaveProperty("frontmatter", {});
    });
});
