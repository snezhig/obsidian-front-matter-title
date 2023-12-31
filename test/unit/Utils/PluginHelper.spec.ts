import PluginHelper, { CompareOperation } from "@src/Utils/PluginHelper";

describe("PluginHelper Test", () => {
    const data: { left: string; right: string; operation: CompareOperation; result: boolean }[] = [
        {
            left: "3.7.1",
            right: "3.7.0",
            operation: ">",
            result: true,
        },
        {
            left: "3.8.1",
            right: "3.7.10",
            operation: ">",
            result: true,
        },
        {
            left: "3.7.2",
            right: "3.7.2",
            operation: ">=",
            result: true,
        },
        {
            left: "1.1.10",
            right: "1.1.0",
            operation: ">=",
            result: true,
        },
        {
            left: "1.1.10",
            right: "1.1.1",
            operation: "!=",
            result: true,
        },
        {
            left: "1.2.2",
            right: "1.2.20",
            operation: "<",
            result: true,
        },
        {
            left: "2.2.20",
            right: "3.3.1",
            operation: ">",
            result: false,
        },
        {
            left: "1.3.30",
            right: "1.3.30",
            operation: "=",
            result: true,
        },
        {
            left: "1.4.40",
            right: "1.4.30",
            operation: "<",
            result: false,
        },
        {
            left: "1.4.40",
            right: "1.4.40",
            operation: ">",
            result: false,
        },
    ];
    for (const item of data) {
        it(`${item.left} ${item.operation} ${item.right} should be ${item.result}`, () => {
            expect(PluginHelper.compareVersion(item.left, item.operation, item.right)).toBe(item.result);
        });
    }
});
