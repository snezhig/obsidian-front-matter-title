import { mock } from "jest-mock-extended";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import Simple from "@src/Creator/Template/Simple";

describe("Simple Test", () => {
    const data = ["foo", "bar", "foobar"];
    for (const item of data) {
        const factory = mock<Factory>();
        const simple = new Simple(factory);
        test(`Test placeholder  [${item}]`, () => {
            simple.setTemplate(item);
            expect(simple.getTemplate()).toEqual(item);
            expect(simple.getPlaceholders()).toHaveLength(1);
            expect(factory.create).toHaveBeenCalledTimes(1);
            expect(factory.create).toHaveBeenCalledWith(item);
        });

        test('Repeated "getPlaceholders" won`t call factory', () => {
            simple.getPlaceholders();
            expect(factory.create).toHaveBeenCalledTimes(1);
        });
    }
});
