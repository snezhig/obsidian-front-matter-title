import PathTemplateInterface from "../../../src/PathTemplate/PathTemplateInterface";
import TemplateTitleUndefinedError from "../../../src/Errors/TemplateTitleUndefinedError";
import Simple from "../../../src/PathTemplate/Simple";


describe('Path Template Test', () => {
    const title = 'simple_title';
    const template = 'simple.template';
    const simple: PathTemplateInterface = new Simple(template);

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