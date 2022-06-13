import FrontMatterParser from "../../../src/Title/FrontMatterParser";
import EmptyMetaPathError from "../../../src/Errors/EmptyMetaPathError";
import {expect} from "@jest/globals";


describe('Parser Test Meta', () => {
    let parser = new FrontMatterParser();

    const frontmatter = {
        title: 'Just a title',
        tier: {one: 'tier.one'},
        list: ['first', 'second'],
        empty_list: [] as unknown[],
        list_with_space: ['first', '', 'second'],
        object: {},
        number: 2
    }


    test('Error in case path is empty', () => {
        expect(() => parser.parse('', frontmatter)).toThrow(EmptyMetaPathError);
    })

    test('Null when path not exist', () => {
        expect(parser.parse('not_exist_path', frontmatter)).toBeNull();
    })

    test('Get title', () => {
        expect(parser.parse('title', frontmatter)).toEqual(frontmatter.title);
    })

    test('Get deep level title', () => {
        expect(parser.parse('tier.one', frontmatter)).toEqual(frontmatter.tier.one);
    })

    test('Get numeric title', () => {
        const title = parser.parse('number', frontmatter);
        expect(title).toEqual(frontmatter.number.toString());
    })

    test('Get error, because value is not a string', () => {
        expect(() => parser.parse('object', frontmatter)).toThrowError(TypeError);
    })

    test('Get first list value', () => {
        const title = parser.parse('list', frontmatter);
        expect(title).toEqual(frontmatter.list[0]);
    })

    test('Null because empty list', () => {
        const title = parser.parse('empty_list', frontmatter);
        expect(title).toBeNull();
    })

    describe('Test delimiter', () => {
        const delimiter = ' [and] ';
        beforeAll(() => parser.setDelimiter(delimiter));

        test('Get all list values joined by delimiter', () => {
            const title = parser.parse('list', frontmatter);
            expect(title).toEqual(`${frontmatter.list[0]}${delimiter}${frontmatter.list[1]}`);
        })

        test('Get all list values joined by delimiter except empty', () => {
            const title = parser.parse('list_with_space', frontmatter);
            expect(title).toEqual(`${frontmatter.list_with_space[0]}${delimiter}${frontmatter.list_with_space[2]}`)
        })

        afterAll(() => parser.setDelimiter(null));
    })


    test('Null with no meta', () => {
        expect(parser.parse('does.not.matter', frontmatter)).toBeNull();
    });

    test('Null with meta but no title', () => {
        expect(parser.parse('does.not.matter', frontmatter)).toBeNull();
    })

});
