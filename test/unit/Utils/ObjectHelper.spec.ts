import ObjectHelper, {Changed} from "@src/Utils/ObjectHelper";

describe('Test compare', () => {

    type d = {
        number: number,
        string: string,
        boolean: boolean,
        array: string[],
        object: {
            foo: string,
            bar: string,
            nested: {
                item: string
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
    })
})