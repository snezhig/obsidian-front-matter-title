import { mock } from "jest-mock-extended";
import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import Extractor from "@src/Components/Extractor/Extractor";
import { expect } from "@jest/globals";
import TypeNotSupportedException from "@src/Components/Extractor/Exceptions/TypeNotSupportedException";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";

describe("Extractor Test", () => {
    const strategies = {
        string: mock<StrategyInterface>(),
        number: mock<StrategyInterface>(),
    };
    const extractor = new Extractor(Object.values(strategies));

    describe("Test types for strategies", () => {
        const types = {
            number: [1, 2.3],
            string: ["", "1", "foo", "false"],
            boolean: [false, true],
            array: [[], [1, 2]],
            object: [{}, { foo: [] }, { foo: "bar" }],
            null: [null as null],
        };
        const strategy = mock<StrategyInterface>();
        strategy.support.mockReturnValue(true);
        const extractor = new Extractor([strategy]);
        beforeEach(() => strategy.support.mockClear());
        for (const [type, values] of Object.entries(types)) {
            for (const v of values) {
                test(`Test ${type} with ${typeof v === "object" ? JSON.stringify(v) : v}`, () => {
                    extractor.extract("path", { path: v });
                    expect(strategy.support).toHaveBeenCalledWith(type);
                });
            }
        }
    });

    describe(`Throws ${PathNotFoundException.name}`, () => {
        const data = [
            { path: "path", obj: {} },
            { path: "path.obj", obj: { path: undefined as any } },
        ];
        for (const item of data) {
            test(`Path ${item.path} will be not found in ${JSON.stringify(item.obj)}`, () => {
                const cb = () => extractor.extract(item.path, item.obj);
                expect(cb).toThrowError(PathNotFoundException);
            });
        }
    });

    describe(`Throws ${TypeNotSupportedException.name}`, () => {
        const data = [{ path: "path", obj: { path: "" } }];
        beforeAll(() => {
            strategies.string.support.mockReturnValue(false);
            strategies.number.support.mockReturnValue(false);
        });
        afterEach(() => {
            strategies.string.support.mockClear();
            strategies.number.support.mockClear();
        });
        for (const item of data) {
            test(`Data type by path ${item.path} in ${JSON.stringify(item.obj)} will not be supported`, () => {
                const cb = () => extractor.extract(item.path, item.obj);
                expect(cb).toThrowError(TypeNotSupportedException);
                expect(strategies.string.support).toHaveBeenCalledTimes(1);
                expect(strategies.number.support).toHaveBeenCalledTimes(1);
            });
        }
    });

    describe("Test extract", () => {
        const data = [
            { path: "foo.bar", obj: { foo: { bar: 2 } }, expected: 2, strategy: "number" },
            { path: "foo.bar.deep", obj: { foo: { bar: { deep: "foobar" } } }, expected: "foobar", strategy: "string" },
        ];
        beforeEach(() => {
            for (const s of Object.values(strategies)) {
                s.process.mockClear();
                s.support.mockReturnValue(false);
            }
        });

        for (const item of data) {
            test(`Extract ${item.expected} by ${item.path} from {${JSON.stringify(item.obj)}`, () => {
                /**@ts-ignore*/
                const strategy = strategies[item.strategy];
                strategy.support.mockReturnValue(true);
                strategy.process.mockReturnValue(item.expected + "-s");

                const actual = extractor.extract(item.path, item.obj);
                expect(actual).toEqual(item.expected + "-s");

                for (const [k, v] of Object.entries(strategies)) {
                    if (k === item.strategy) {
                        expect(v.process).toHaveBeenCalledTimes(1);
                        expect(v.process).toHaveBeenCalledWith(item.expected);
                    } else {
                        expect(v.process).not.toHaveBeenCalled();
                    }
                }
            });
        }
    });
});
