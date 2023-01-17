import Cache from "../../../../src/Components/Cache/Cache";
import CacheInterface from "../../../../src/Components/Cache/CacheInterface";

describe("Cache Test", () => {
    let cache: CacheInterface = null;
    const recreate = () => (cache = new Cache());

    describe("Test single FooBar", () => {
        beforeAll(() => {
            recreate();
        });
        test("Item is not hit", () => {
            expect(cache.getItem("foo").isHit()).toBeFalsy();
        });
        test("Get bar by foo key", () => {
            cache.save(cache.getItem<string>("foo").set("bar"));
            expect(cache.getItem("foo").isHit()).toBeTruthy();
            expect(cache.getItem("foo").get()).toEqual("bar");
        });
        test("Delete bar by foo key", () => {
            cache.delete("foo");
            expect(cache.getItem("foo").isHit()).toBeFalsy();
        });
        afterAll(recreate);
    });

    describe("Test some values", () => {
        const data = {
            first: "first_value",
            second: "second_value",
            third: "third_value",
        };
        beforeAll(() => {
            recreate();
            for (const [k, v] of Object.entries(data)) {
                cache.save(cache.getItem(k).set(v));
            }
        });

        test("Get all values", () => {
            for (const [k, v] of Object.entries(data)) {
                expect(cache.getItem(k).isHit()).toBeTruthy();
                expect(cache.getItem(k).get()).toEqual(v);
            }
        });

        test("Delete one, but keep others", () => {
            const deleted = "first";
            cache.delete(deleted);
            for (const [k, v] of Object.entries(data)) {
                const item = cache.getItem(k);
                if (k === deleted) {
                    expect(item.isHit()).toBeFalsy();
                } else {
                    expect(item.isHit()).toBeTruthy();
                    expect(item.get()).toEqual(v);
                }
            }
        });

        test("Clear all", () => {
            cache.clear();
            for (const key of Object.keys(data)) {
                expect(cache.getItem(key).isHit()).toBeFalsy();
            }
        });
    });

    describe("Test object values", () => {
        type Value = { value: string; children: number[] };
        let actual: Value = null;
        let expected: Value = null;
        const key = "object.value";
        beforeAll(() => {
            recreate();
            expected = { value: "test_value", children: [10, 20] };
            actual = { value: "test_value", children: [10, 20] };
            cache.save(cache.getItem(key).set(actual));
        });
        afterAll(recreate);

        test("Item isHit and Equal", () => {
            const item = cache.getItem(key);
            expect(item.isHit()).toBeTruthy();
            expect(item.get()).toEqual(actual);
            expect(item.get()).toEqual(expected);
        });

        test("Value changing won affect on cache", () => {
            actual.value = "changed_value";
            actual.children = [];
            const item = cache.getItem(key);
            expect(item.get()).not.toEqual(actual);
            expect(item.get()).toEqual(expected);
        });
    });

    describe("Test object values with functions", () => {
        test("Should throw error because of internal function", () => {
            const value = {
                foo: "foo",
                bar: () => "bar",
            };
            const key = "object-with-function";

            expect(() => cache.save(cache.getItem(key).set(value))).toThrowError(
                "Object with functions can not be serialized"
            );
        });
        test("Should throw error because of nested function", () => {
            const value = {
                foo: "foo",
                bar: {
                    baz: () => "baz",
                },
            };
            const key = "object-with-nested-function";

            expect(() => cache.save(cache.getItem(key).set(value))).toThrowError(
                "Object with functions can not be serialized"
            );
        });
    });
});
