import FunctionReplacer from "@src/Utils/FunctionReplacer";

describe("FunctionReplacer.tryCreate (fail-soft)", () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    test("returns a working replacer when the method exists", () => {
        const target = { greet: (name: string) => `hi ${name}` };
        const replacer = FunctionReplacer.tryCreate(target, "greet", null, (_args, defaultArgs, vanilla) => {
            return `[${vanilla.apply(target, defaultArgs)}]`;
        });

        expect(replacer).not.toBeNull();
        replacer.enable();
        expect(target.greet("bob")).toBe("[hi bob]");
        replacer.disable();
        expect(target.greet("bob")).toBe("hi bob");
    });

    test("returns null (no throw) when the method is missing", () => {
        const target = { notAFunction: 42 } as any;
        const replacer = FunctionReplacer.tryCreate(target, "notAFunction", null, () => undefined);

        expect(replacer).toBeNull();
        expect(warnSpy).toHaveBeenCalled();
    });

    test("returns null (no throw) when the target is null", () => {
        const replacer = FunctionReplacer.tryCreate(null as any, "whatever" as any, null, () => undefined);
        expect(replacer).toBeNull();
    });

    test("create still throws on a missing method (strict path unchanged)", () => {
        const target = { x: 1 } as any;
        expect(() => FunctionReplacer.create(target, "x", null, () => undefined)).toThrow();
    });
});
