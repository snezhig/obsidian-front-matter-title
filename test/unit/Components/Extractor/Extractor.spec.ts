import {mock} from "jest-mock-extended";
import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import Extractor from "@src/Components/Extractor/Extractor";
import {expect} from "@jest/globals";
import TypeNotSupportedException from "@src/Components/Extractor/Exceptions/TypeNotSupportedException";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";

describe('Extractor Test', () => {
    const strategies = {
        literal: mock<StrategyInterface>(),
        array: mock<StrategyInterface>()
    };
    const extractor = new Extractor(Object.values(strategies));

    describe(`Throws ${PathNotFoundException.name}`, () => {
        const data = [{path: 'path', obj: {}}];
        for (const item of data) {
            test(`Path ${item.path} will be not found in ${JSON.stringify(item.obj)}`, () => {
                const cb = () => extractor.extract(item.path, item.obj);
                expect(cb).toThrowError(PathNotFoundException);
            })
        }
    });

    describe(`Throws ${TypeNotSupportedException.name}`, () => {
        const data = [{path: 'path', obj: {path: ''}}];
        beforeAll(() => {
            strategies.literal.support.mockReturnValue(false);
            strategies.array.support.mockReturnValue(false);

        })
        afterEach(() => {
            strategies.literal.support.mockClear();
            strategies.array.support.mockClear();
        })
        for (const item of data) {
            test(`Data type by path ${item.path} in ${JSON.stringify(item.obj)} will not be supported`, () => {
                const cb = () => extractor.extract(item.path, item.obj);
                expect(cb).toThrowError(TypeNotSupportedException);
                expect(strategies.literal.support).toHaveBeenCalledTimes(1);
                expect(strategies.array.support).toHaveBeenCalledTimes(1);
            })
        }
    });

    describe('Test extract', () => {
        const data = [
            {path: 'foo.bar', obj: {foo: {bar: 2}}, expected: '2', strategy: 'literal'}
        ];
        beforeEach(() => {
            for (const s of Object.values(strategies)) {
                s.support.mockReturnValue(false);
            }
        })

        for (const item of data) {
            test(`Extract ${item.expected} by ${item.path} from {${JSON.stringify(item.obj)}`, () => {
                /**@ts-ignore*/
                const strategy = strategies[item.strategy];
                strategy.support.mockReturnValue(true);
                strategy.process.mockReturnValue(item.expected + '-s');

                const actual = extractor.extract(item.path, item.obj);
                expect(actual).toEqual(item.expected + '-s');

                for (const [k, v] of Object.entries(strategies)) {
                    if (k === item.strategy) {
                        expect(v.process).toHaveBeenCalledTimes(1);
                        expect(v.process).toHaveBeenCalledWith(item.expected);
                    } else {
                        expect(v.process).not.toHaveBeenCalled();
                    }
                }
            })
        }
    })
});