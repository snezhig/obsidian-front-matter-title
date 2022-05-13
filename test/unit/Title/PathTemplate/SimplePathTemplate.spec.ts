import SimplePathTemplate from "../../../../src/Title/PathTemplate/SimplePathTemplate";
import PathTemplateParser from "../../../../src/Title/PathTemplate/PathTemplateParser";
import TemplateTitleUndefinedError from "../../../../src/Errors/TemplateTitleUndefinedError";


describe('Path Template Test', () => {
    const title = 'simple_title';
    const template = 'simple.template';
    const simple: PathTemplateParser = new SimplePathTemplate(template);

    test('Return paths', () => {
        expect(simple.getMetaPaths()).toEqual([template]);
    })

    test('Return title', () => {
        expect(simple.buildTitle({[template]: title})).toEqual(title);
    })

    test('Return null', () => {
        expect(simple.buildTitle({[template]: null})).toBeNull();
        expect(simple.buildTitle({[template]: ''})).toBeNull();
    })

    test('Throw error', () => {
        expect(() => simple.buildTitle({template})).toThrowError(TemplateTitleUndefinedError);
    })
})