import MetaParser, {Meta} from "../../../src/Title/MetaParser";
import EmptyMetaPathError from "../../../src/Errors/EmptyMetaPathError";
import {expect} from "@jest/globals";
import * as fs from "fs";
import YAML from "yaml";
import path = require("path");

describe('Parser Test Meta', () => {
    let parser = MetaParser;
    let fileName = "HasMetaTitle.md";
    const getMeta = (): Meta => {
        const content = fs.readFileSync(path.join(__dirname, `../../docs/${fileName}`), 'utf8');
        const yaml = content.match(/^---\n(?<yaml>.*?)---/s)?.groups?.yaml;
        let metadata: Meta = {};
        if (yaml) {
            metadata = YAML.parse(yaml);
        }
        return metadata;
    };

    test('Error in case path is empty',  () => {
        expect(() => parser.parse('', getMeta())).toThrow(EmptyMetaPathError);
    })

    test('Null when path not exist', () => {
        expect(parser.parse('not_exist_path', getMeta())).toBeNull();
    })

    test('Get title', () => {
        expect(parser.parse('title', getMeta())).toEqual('TitleToReplace');
    })

    test('Get deep level title', () => {
        expect(parser.parse('title_d.deep.level', getMeta())).toEqual('Title on third level');
    })

    test('Get numeric title', () => {
        const title = parser.parse('title_number', getMeta());
        expect(title).toEqual('1234567');
    })

    test('Get error, because value is not a string', () => {
        expect(() => parser.parse('title_obj', getMeta())).toThrowError(TypeError);
    })

    test('Null with no meta', () => {
        fileName = 'HasNoMeta.md';
        expect(parser.parse('does.not.matter', getMeta())).toBeNull();
    });

    test('Null with meta but no title', () => {
        fileName = 'HasMetaWithoutTitle.md';
        expect(parser.parse('does.not.matter', getMeta())).toBeNull();
    })
});
