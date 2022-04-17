import MetaTitleParser from "../../src/MetaTitleParser";
import EmptyMetaPathError from "../../src/Errors/EmptyMetaPathError";
import {expect} from "@jest/globals";
import path = require("path");
import * as fs from "fs";

describe('Parser Test Meta', () => {
	let parser = MetaTitleParser;
	let fileName = "HasMeta.md";
	const getContent = () => fs.readFileSync(path.join(__dirname, `../docs/${fileName}`), 'utf8');

	test('Error in case path is empty', async () => {
		await expect(parser.parse('', getContent())).rejects.toThrow(EmptyMetaPathError);
	})

	test('Null when path not exist', async () => {
		await expect(parser.parse('not_exist_path', getContent())).resolves.toBeNull();
	})

	test('Get title', async () => {
		await expect(parser.parse('title', getContent())).resolves.toEqual('TitleToReplace');
		await expect(parser.parse('title_d.deep.level',getContent())).resolves.toEqual('Title on third level');
	})

	test('Null with no meta', async () => {
		fileName = 'HasNoMeta.md';
		await expect(parser.parse('does.not.matter', getContent())).resolves.toBeNull();
	});
});
