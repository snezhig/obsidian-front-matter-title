import {mock} from "jest-mock-extended";
import TemplateInterface from "../../../src/Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../../src/Interfaces/TemplatePlaceholderInterface";
import Creator from "../../../src/Creator/Creator";

describe('Test Creator', () => {
    const path = '/path/to/file.md';
    const templateStr = 'static_dynamic_static';
    const expected = 'static_(static)_static';
    const template = mock<TemplateInterface>();
    const placeholder = mock<TemplatePlaceholderInterface>();
    template.getPlaceholders.mockReturnValue([placeholder]);
    template.getTemplate.mockReturnValue(templateStr);

    test('Create title', () => {
        placeholder.makeValue.mockReturnValue('(static)');
        placeholder.getPlaceholder.mockReturnValue('dynamic');

        const creator = new Creator(template);
        const actual = creator.create(path);

        expect(actual).toEqual(expected);
        expect(placeholder.getPlaceholder).toHaveBeenCalledTimes(1);
        expect(placeholder.makeValue).toHaveBeenNthCalledWith(1, path);
        expect(template.getTemplate).toHaveBeenCalledTimes(1);
        expect(template.getPlaceholders).toHaveBeenCalledTimes(1);
    })
})