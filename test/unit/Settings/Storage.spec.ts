import Storage from "@src/Settings/Storage";

describe('Storage Test', () => {
    type d = {
        foo: {
            bar: {
                value: number
            }
        },
        foobar: boolean
    }

    const data: d = {
        foo: {bar: {value: 10}},
        foobar: true
    }

    const storage = new Storage<d>(data);
    test('Go through foo key', () => {
        expect(storage.get('foo').get('bar').get('value').value()).toEqual(data.foo.bar.value);
    })
})