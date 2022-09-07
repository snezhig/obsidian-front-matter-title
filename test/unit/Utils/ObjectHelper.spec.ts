import ObjectHelper, {Changed} from "@src/Utils/ObjectHelper";

describe('Test compare', () => {

    type d = {
        number?: number,
        string?: string,
        boolean?: boolean,
        array?: string[],
        object?: {
            foo?: string,
            bar?: string,
            nested?: {
                item?: string
            }
        }
    }
    const data: d = {
        number: 2,
        string: 'foobar',
        boolean: false,
        array: ['foo', 'bar'],
        object: {
            foo: 'bar',
            bar: 'foo',
            nested: {
                item: 'value'
            }
        }
    }

    test('Should return empty object', () => {
        const changed = ObjectHelper.compare(data, {...data});
        Object.keys(data).forEach(e => expect(changed).not.toHaveProperty(e));
    })

    test('Should return diff for nested', () => {
        const changed: Changed<d> = {
            object: {nested: {item: true}}
        };
        const actual = JSON.parse(JSON.stringify(data));
        actual.object.nested.item = Math.random().toString();

        expect(ObjectHelper.compare(data, actual)).toEqual(changed);
        expect(ObjectHelper.compare(actual, data)).toEqual(changed);
    })
    test('Should return diff for undefined', () => {
        const actual = JSON.parse(JSON.stringify(data));
        delete actual.object;
        const expected = {object: {foo: true, bar: true, nested: {item: true}}};
        expect(ObjectHelper.compare(data, actual)).toEqual(expected);
        expect(ObjectHelper.compare(actual, data)).toEqual(expected);
    })

    test('Should return diff for array', () => {
        const second = JSON.parse(JSON.stringify(data));
        second.array = ['foo'];
        const expected = {array: true};
        expect(ObjectHelper.compare(data, second)).toEqual(expected);
        expect(ObjectHelper.compare(second, data)).toEqual(expected);
    })
})

describe('Test fillFrom', () => {
    type obj = {
        foo: { bar?: number },
        baz: string,
        qux: any[],
        thud: number
    }
    type dynamic<T> = { [K in keyof T]?: T[K] | null }
    const def = (): dynamic<obj> => ({
        foo: {bar: 23},
        baz: 'quux',
        qux: ['corge']
    })

    test('Should return def without changes', () => {
        expect(ObjectHelper.fillFrom(def(), {})).toEqual(def());
        expect(ObjectHelper.fillFrom(def(), {foo: null, qux: null})).toEqual(def());
        expect(ObjectHelper.fillFrom(def(), {thud: 32})).toEqual(def());
    })

    test('Should change bar to null', () => {
        expect(ObjectHelper.fillFrom(def(), {foo: {bar: null}})).toHaveProperty('foo.bar', null);
    })

})