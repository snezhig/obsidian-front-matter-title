import Storage from "@src/Storage/Storage";

describe("Storage Test", () => {
    type d = {
        foo: {
            bar: {
                value: number;
            };
        };
        foobar: boolean;
        array: string[];
    };

    const data: d = {
        foo: { bar: { value: 10 } },
        foobar: true,
        array: [],
    };

    const storage = new Storage<d>(data);
    test("Go through foo key", () => {
        expect(storage.get("foo").get("bar").get("value").value()).toEqual(data.foo.bar.value);
    });

    test("Change foobar value", () => {
        expect(storage.get("foobar").value()).toBeTruthy();
        storage.get("foobar").set(false);
        expect(storage.get("foobar").value()).toBeFalsy();
        storage.get("foobar").set(true);
    });

    test("Collect values", () => {
        expect(storage.collect()).toEqual(data);
    });

    test("Should return empty array", () => {
        expect(storage.get("array").value()).toEqual([]);
    });
});
