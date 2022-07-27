import Composite from "@src/Creator/Template/Composite";
import Container from "../../../../config/inversify.config";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import TYPES from "@config/inversify.types";
import {mock} from "jest-mock-extended";
import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";

const factory = mock<Factory>();
const create = (template: string) => new Composite(Container.get(TYPES['template.pattern']), template, factory);
describe('Composite Test', () => {
    test('Get Template', () => {
        const template = 'foo {{plc}} bar';
        expect(create(template).getTemplate()).toEqual(template);
    });

    describe('Test placeholders', () => {
        factory.create.mockImplementation((p: string) => {
            const placeholder = mock<TemplatePlaceholderInterface>();
            placeholder.getPlaceholder.mockReturnValue(p);
            return placeholder;
        });
        beforeEach(() => factory.create.mockClear());

        const data = [
            {template: '{foo}} {{ bar}}', placeholders: ['{{ bar}}']},
            {template: '{{{foo}} {{ bar _ }}', placeholders: ['{{foo}}', '{{ bar _ }}']},
        ];

        for (const item of data) {
            test(`Test template [${item.template}]`, () => {
                const composite = create(item.template);
                const placeholders = composite.getPlaceholders();
                expect(placeholders.length).toEqual(item.placeholders.length);
                for (const p of item.placeholders) {
                    expect(factory.create).toHaveBeenCalledWith(p);
                }
            })
        }
    })

})