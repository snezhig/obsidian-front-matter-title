import Cache from "../../../../src/Components/Cache/Cache";
import CacheInterface from "../../../../src/Components/Cache/CacheInterface";

describe('Cache Test', () => {
    let cache: CacheInterface = null;
    const recreate = () => cache = new Cache();

    describe('Test single FooBar', () => {
        beforeAll(() => {
            recreate()
            cache.set('foo', 'bar')
        });
        test('Get bar by foo key', () => expect(cache.get('foo')).toEqual('bar'))
        test('Delete bar by foo key', () => {
            cache.delete('foo');
            expect(cache.get('foo')).toBeNull();
        })
        afterAll(recreate);
    })

    describe('Test some values', () => {
        const data = {
            first: 'first_value',
            second: 'second_value',
            third: 'third_value'
        }
        beforeAll(() => {
            recreate();
            for (const [k, v] of Object.entries(data)) {
                cache.set(k, v);
            }
        })

        test('Get all values', () => {
            for (const [k, v] of Object.entries(data)) {
                expect(cache.get(k)).toEqual(v);
            }
        })

        test('Delete one, but keep another', () => {
            const deleted = 'first';
            cache.delete(deleted);
            for (const [k, v] of Object.entries(data)) {
                expect(cache.get(k)).toEqual(k === deleted ? null : v);
            }
        })

        test('Clear all', () => {
            cache.clear();
            for (const key of Object.keys(data)) {
                expect(cache.get(key)).toBeNull();
            }
        })

    })
})