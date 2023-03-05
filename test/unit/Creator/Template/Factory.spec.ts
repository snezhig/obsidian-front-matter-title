import Factory from "@src/Creator/Template/Factory";
import { mock } from "jest-mock-extended";
import { TemplateInterface } from "@src/Creator/Interfaces";

describe("Factory Test", () => {
    beforeEach(() => resolver.mockClear);
    const resolver = jest.fn((named: string): TemplateInterface => mock<TemplateInterface>());
    const data = [
        { template: "foobar", pattern: "{{.*}}", type: "simple" },
        { template: "{{foobar}}", pattern: "{{.*}}", type: "composite" },
        { template: "{{foobar}_}", pattern: "{{.*}}", type: "simple" },
    ];

    for (const item of data) {
        test(`Test [${item.template}] with [${item.pattern}], expecting [${item.type}]`, () => {
            const factory = new Factory(item.pattern, resolver);
            factory.create(item.template);
            expect(resolver).toHaveBeenLastCalledWith(item.type);
        });
    }
});
