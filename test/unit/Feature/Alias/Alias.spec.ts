import Alias from "@src/Feature/Alias/Alias";

describe("Test get key and value", () => {
    test("Should return `alias` as a key and `foo` as a value", () => {
        const alias = new Alias({ alias: "foo", aliases: "" });
        expect(alias.getKey()).toEqual("alias");
        expect(alias.getValue()).toEqual("foo");
    });
    test("Should return `aliases` as a key and `bar` as a value", () => {
        const alias = new Alias({ aliases: "bar", alias: "" });
        expect(alias.getKey()).toEqual("aliases");
        expect(alias.getValue()).toEqual("bar");
    });
    test("Should return null", () => {
        const alias = new Alias({ _alias: "", _aliases: "" });
        expect(alias.getKey()).toBeNull();
        expect(alias.getValue()).toBeNull();
    });
});

describe("Test side effect", () => {
    const data = { alias: ["value"], aliases: ["bar"] };
    const alias = new Alias(data);
    test('Should return `alias` as a key and `["value"]` as a value', () => {
        expect(alias.getKey()).toEqual("alias");
        expect(alias.getValue()).toEqual(["value"]);
    });
    test('Should return `aliases` as a key and `["bar"]` as a value', () => {
        delete data.alias;
        expect(alias.getKey()).toEqual("aliases");
        expect(alias.getValue()).toEqual(["bar"]);
    });
    test("Should return null", () => {
        delete data.aliases;
        expect(alias.getKey()).toBeNull();
        expect(alias.getValue()).toBeNull();
    });
});

describe("Test mutation", () => {
    const original = { alias: ["foo", "bar"] };
    const data = JSON.parse(JSON.stringify(original));
    const alias = new Alias(data);

    test("Should set `baz` as a value and modify data", () => {
        expect(alias.getValue()).toEqual(original.alias);
        alias.setValue("baz");
        expect(data.alias).toEqual("baz");
        expect(alias.getValue()).toEqual("baz");
        expect(alias.isChanged()).toBeTruthy();
    });

    test('Should set `["quote"]` as  a value and modify data', () => {
        alias.setValue(["quote"]);
        expect(data.alias).toEqual(["quote"]);
        expect(alias.getValue()).toEqual(["quote"]);
    });

    test("Should restore original data", () => {
        expect(original.alias).toEqual(["foo", "bar"]);
        expect(data.alias).not.toEqual(["foo", "bar"]);
        expect(alias.getValue()).not.toEqual(["foo", "bar"]);
        alias.restore();
        expect(data.alias).toEqual(original.alias);
        expect(alias.getValue()).toEqual(original.alias);
    });
});
describe("Test mutation of empty object", () => {
    const data: { alias?: any } = {};
    const alias = new Alias(data);
    test("Should set `foo` as a value and create new key", () => {
        expect(alias.getKey()).toBeNull();
        expect(alias.getValue()).toBeNull();
        alias.setValue("foo");
        expect(alias.getKey()).toEqual("alias");
        expect(alias.getValue()).toEqual("foo");
        expect(data.alias).toEqual("foo");
    });
    test("Should restore data", () => {
        alias.restore();
        expect(alias.getKey()).toBeNull();
        expect(alias.getValue()).toBeNull();
        expect(data).not.toHaveProperty("alias");
    });
});
