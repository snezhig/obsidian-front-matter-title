import Composite from "../../../src/PathTemplate/Composite";
import TemplateTitleUndefinedError from "../../../src/Errors/TemplateTitleUndefinedError";

const data: {
    template: string,
    paths: {[k: string]: any},
    title: string
}[]
    = [
    {
        template: '{{simple.title}}',
        paths: {
            'simple.title': 'simple_title_value'
        },
        title: 'simple_title_value',
    },
    {
        template: '{{simple}}{{second}}',
        paths: {
            'simple': 'simple title',
            'second': ' and second'
        },
        title: 'simple title and second',
    },
    {
        template: 'left{{first.empty}}middle{{second.empty}}right',
        paths: {
            'first.empty': '',
            'second.empty': ''
        },
        title: 'leftmiddleright',
    },
    {
        template: 'left{{first.dash}}middle{{second.dash}}right',
        paths: {
            'first.dash': '-',
            'second.dash': '-'
        },
        title: 'left-middle-right',
    },
    {
        template: '{{title.value}}-{{nullpoint}}',
        paths: {
            "title.value": 'value',
            nullpoint: null
        },
        title: 'value-'
    },
    {
        template: '{{first_null}}-{{second_empty}}',
        paths: {
            first_null: null,
            second_empty: ''
        },
        title: '-'
    },
    {
        template: '{{first_null}}{{second_null}}',
        paths: {
            first_null: null,
            second_null: null
        },
        title: null
    },
    {
        template: "{{ around_space }}",
        paths: {
            around_space: 'ap'
        },
        title: 'ap'
    }
]

describe('Composite Path Template Test', () => {
    for (const item of data){
        const pathTemplate = new Composite(item.template);
        test(`Test template "${item.template}" paths`, () => {
            expect(pathTemplate.getMetaPaths()).toEqual(Object.keys(item.paths));
        })

        test(`Test template "${item.template}" title`, () => {
            expect(pathTemplate.buildTitle(item.paths)).toEqual(item.title);
        })
    }

    test('Throw error because title from template is undefined', () => {
        const pathTemplate = new Composite('{{first}}-{{second}}');
        expect(() => pathTemplate.buildTitle({})).toThrowError(TemplateTitleUndefinedError);
    })
})