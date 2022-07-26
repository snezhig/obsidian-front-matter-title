import MetaPlaceholder from "@src/Creator/Template/Placeholders/MetaPlaceholder";
import FrontMatterParser, {Meta} from "@src/Title/FrontMatterParser";

jest.mock("../../../../../src/Title/FrontMatterParser");

describe('Meta Placeholder Test', () => {
    const placeholder = 'foobar';
    const expected = 'barfoo';
    const path = '/path/to/file.md';
    const parse = jest.spyOn<FrontMatterParser, 'parse'>(FrontMatterParser.prototype, 'parse').mockReturnValue(expected);
    const meta: Meta = {};
    const metaFactory = jest.fn((path: string) => meta);
    const metaPlaceholder = new MetaPlaceholder(new FrontMatterParser(), metaFactory);

    test('Set and get placeholder', () => {
        metaPlaceholder.setPlaceholder(placeholder);
        expect(metaPlaceholder.getPlaceholder()).toEqual(placeholder);
    })

    test(`Placeholder will return "${expected}"`, () => {
        const actual = metaPlaceholder.makeValue(path);
        expect(actual).toEqual(expected);
    })

    test('Dependencies have been called', () => {
        expect(metaFactory).toHaveBeenCalledWith(path);
        expect(parse).toHaveBeenCalledWith(placeholder, meta);
    })
})
