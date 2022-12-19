import Composite from "@src/Creator/Template/Composite";
import Container from "../../../../config/inversify.config";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import SI from "@config/inversify.types";
import { mock } from "jest-mock-extended";
import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";

const factory = mock<Factory>();
const create = (template: string) => {
    const c = new Composite(Container.get(SI["template:pattern"]), factory);
    c.setTemplate(template);
    return c;
};
describe("Composite Test", () => {
    test("Get Template", () => {
        const template = "foo {{plc}} bar";
        expect(create(template).getTemplate()).toEqual(template);
    });

    describe("Test placeholders", () => {
        factory.create.mockImplementation((p: string) => {
            const placeholder = mock<TemplatePlaceholderInterface>();
            placeholder.getPlaceholder.mockReturnValue(p);
            return placeholder;
        });
        beforeEach(() => factory.create.mockClear());

        const data = [
            { template: "{foo}} {{ bar}}", placeholders: ["{{ bar}}"] },
            { template: "{{{foo}} {{ bar _ }}", placeholders: ["{{foo}}", "{{ bar _ }}"] },
            { template: "{{{fo{o}} {{ bar _ }}", placeholders: ["{{ bar _ }}"] },
            {
                template: "{{#heading}} {{ #heading }} {{bar}}",
                placeholders: ["{{#heading}}", "{{ #heading }}", "{{bar}}"],
            },
        ];

        for (const item of data) {
            test(`Test template [${item.template}]`, () => {
                const composite = create(item.template);
                composite.getPlaceholders();
                const placeholders = composite.getPlaceholders();
                expect(placeholders.length).toEqual(item.placeholders.length);
                expect(factory.create).toHaveBeenCalledTimes(item.placeholders.length);
                for (const p of item.placeholders) {
                    expect(factory.create).toHaveBeenCalledWith(p);
                }
            });
        }
    });
});
