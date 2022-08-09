import ArrayStrategy from "@src/Components/Extractor/ArrayStrategy";
import {expect} from "@jest/globals";

const delimiterGetter = jest.fn(() => null);
describe('Test support', () => {
    const notSupported = [1, '1', 1.2, 'foo', '', false, true, {}, {foo: 'bar'}];
    for (const v of notSupported){
        test(`Should return false support`, () => {
            expect((new ArrayStrategy(delimiterGetter)).support(typeof v)).toBeFalsy();
        })
    }

    test('Should return true support', () => {
        expect((new ArrayStrategy(delimiterGetter).support('array'))).toBeTruthy();
    })
})

describe('Test process', () => {
    test('Should return null because empty', () => {
        expect((new ArrayStrategy(delimiterGetter)).process([])).toBeNull();
    })

    test('Should return empty string', () => {
        expect((new ArrayStrategy(delimiterGetter)).process([''])).toEqual('');
    })

    test('Should return first value', () => {
        expect(new ArrayStrategy(delimiterGetter).process(['foo', 'bar'])).toEqual('foo');
    })

    test('Should return all values split by _', () => {
        delimiterGetter.mockReturnValueOnce('_');
        expect((new ArrayStrategy(delimiterGetter).process(['foo', 'bar']))).toEqual('foo_bar');
    })
})