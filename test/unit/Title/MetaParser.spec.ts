import MetaParser, {Meta} from "../../../src/Title/MetaParser";
import EmptyMetaPathError from "../../../src/Errors/EmptyMetaPathError";
import {expect} from "@jest/globals";
import * as fs from "fs";
import {CachedMetadata} from "obsidian";
import YAML from "yaml";
import path = require("path");

describe('PathTemplate Test Meta', () => {
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

    test('Error in case path is empty', async () => {
        await expect(parser.parse('', getMeta())).rejects.toThrow(EmptyMetaPathError);
    })

    test('Null when path not exist', async () => {
        await expect(parser.parse('not_exist_path', getMeta())).resolves.toBeNull();
    })

    test('Get title', async () => {
        await expect(parser.parse('title', getMeta())).resolves.toEqual('TitleToReplace');
    })

    test('Get deep level title', async () => {
        await expect(parser.parse('title_d.deep.level', getMeta())).resolves.toEqual('Title on third level');
    })

    test('Get numeric title', async () => {
        const title = await parser.parse('title_number', getMeta());
        expect(title).toEqual('1234567');
    })

    test('Get error, because value is not a string', async () => {
        const promise = parser.parse('title_obj', getMeta());
        await expect(promise).rejects.toThrowError(TypeError);
    })

    test('Null with no meta', async () => {
        fileName = 'HasNoMeta.md';
        await expect(parser.parse('does.not.matter', getMeta())).resolves.toBeNull();
    });

    test('Null with meta but no title', async () => {
        fileName = 'HasMetaWithoutTitle.md';
        await expect(parser.parse('does.not.matter', getMeta())).resolves.toBeNull();
    })
});
