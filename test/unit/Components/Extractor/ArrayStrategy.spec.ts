import ArrayStrategy from "@src/Components/Extractor/ArrayStrategy";
import {expect} from "@jest/globals";

describe('Test support', () => {
    const notSupported = [1, '1', 1.2, 'foo', '', false, true, {}, {foo: 'bar'}];
    for (const v of notSupported){
        test(`Should return false support`, () => {
            expect((new ArrayStrategy(null)).support(typeof v)).toBeFalsy();
        })
    }

    test('Should return true support', () => {
        expect((new ArrayStrategy(null).support('array'))).toBeTruthy();
    })
})

describe('Test process', () => {
    test('Should return null because empty', () => {
        expect((new ArrayStrategy(null)).process([])).toBeNull();
    })

    test('Should return empty string', () => {
        expect((new ArrayStrategy(null)).process([''])).toEqual('');
    })

    test('Should return first value', () => {
        expect(new ArrayStrategy(null).process(['foo', 'bar'])).toEqual('foo');
    })

    test('Should return all values split by _', () => {
        expect((new ArrayStrategy('_').process(['foo', 'bar']))).toEqual('foo_bar');
    })
})