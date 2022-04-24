import MetaTitleParser from "../../src/MetaTitleParser";
import EmptyMetaPathError from "../../src/Errors/EmptyMetaPathError";
import {expect} from "@jest/globals";
import path = require("path");
import * as fs from "fs";

describe('Parser Test Meta', () => {
	let parser = MetaTitleParser;
	let fileName = "HasMetaTitle.md";
	const getContent = () => fs.readFileSync(path.join(__dirname, `../docs/${fileName}`), 'utf8');

	test('Error in case path is empty', async () => {
		await expect(parser.parse('', getContent())).rejects.toThrow(EmptyMetaPathError);
	})

	test('Null when path not exist', async () => {
		await expect(parser.parse('not_exist_path', getContent())).resolves.toBeNull();
	})

	test('Get title', async () => {
		await expect(parser.parse('title', getContent())).resolves.toEqual('TitleToReplace');
	})

	test('Get deep level title', async () => {
		await expect(parser.parse('title_d.deep.level', getContent())).resolves.toEqual('Title on third level');
	})

	test('Get numeric title', async() => {
		const title = await parser.parse('title_number', getContent());
		expect(title).toEqual('1234567');
	})

	test('Get error, because value is not a string', async () => {
		const promise = parser.parse('title_obj', getContent());
		await expect(promise).rejects.toThrowError(TypeError);
	})

	test('Null with no meta', async () => {
		fileName = 'HasNoMeta.md';
		await expect(parser.parse('does.not.matter', getContent())).resolves.toBeNull();
	});

	test('Null with meta but no title', async () => {
		fileName = 'HasMetaWithoutTitle.md';
		await expect(parser.parse('does.not.matter', getContent())).resolves.toBeNull();
	})
});
