import MetaParser from "../../../src/Title/MetaParser";
import EmptyMetaPathError from "../../../src/Errors/EmptyMetaPathError";
import {expect} from "@jest/globals";
import * as fs from "fs";
import {CachedMetadata} from "obsidian";
import YAML from "yaml";
import path = require("path");

describe('Parser Test Meta', () => {
    let parser = MetaParser;
    let fileName = "HasMetaTitle.md";
    const getMetadata = (): CachedMetadata => {
        const content = fs.readFileSync(path.join(__dirname, `../../docs/${fileName}`), 'utf8');
        const yaml = content.match(/^---\n(?<yaml>.*?)---/s)?.groups?.yaml;
        let metadata: CachedMetadata = {};
        if (yaml) {
            metadata.frontmatter = YAML.parse(yaml);
        }
        return metadata;
    };

    test('Error in case path is empty',  () => {
        expect(() => parser.parse('', getMetadata())).toThrow(EmptyMetaPathError);
    })

    test('Null when path not exist', () => {
        expect(parser.parse('not_exist_path', getMetadata())).toBeNull();
    })

    test('Get title', () => {
        expect(parser.parse('title', getMetadata())).toEqual('TitleToReplace');
    })

    test('Get deep level title', () => {
        expect(parser.parse('title_d.deep.level', getMetadata())).toEqual('Title on third level');
    })

    test('Get numeric title', () => {
        const title = parser.parse('title_number', getMetadata());
        expect(title).toEqual('1234567');
    })

    test('Get error, because value is not a string', () => {
        expect(() => parser.parse('title_obj', getMetadata())).toThrowError(TypeError);
    })

    test('Null with no meta', () => {
        fileName = 'HasNoMeta.md';
        expect(parser.parse('does.not.matter', getMetadata())).toBeNull();
    });

    test('Null with meta but no title', () => {
        fileName = 'HasMetaWithoutTitle.md';
        expect(parser.parse('does.not.matter', getMetadata())).toBeNull();
    })
});
