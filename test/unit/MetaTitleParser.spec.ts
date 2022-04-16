import MetaTitleParser from "../../src/MetaTitleParser";
import {TFile, Vault} from "obsidian";
import EmptyMetaPathError from "../../src/Errors/EmptyMetaPathError";
import {expect} from "@jest/globals";
import path = require("path");

describe('Parser Test Meta', () => {
	let parser: MetaTitleParser = null;
	let file: TFile = null;

	beforeEach(() => {
		file = new TFile();
		file.vault = new Vault();
		file.path = path.join(__dirname, '../docs/HasMeta.md')
		parser = new MetaTitleParser(file);
	})

	test('Get File', () => {
		expect(parser.getFile()).toBe(file);
	})

	test('Error in case path is empty', async () => {
		await expect(parser.parse('')).rejects.toThrow(EmptyMetaPathError);
	})

	test('Null when path not exist', async () => {
		await expect(parser.parse('not_exist_path')).resolves.toBeNull();
	})

	test('Get title', async () => {
		await expect(parser.parse('title')).resolves.toEqual('TitleToReplace');
		await expect(parser.parse('title_d.deep.level')).resolves.toEqual('Title on third level');
	})

	test('Null with no meta', async () => {
		file.path = path.join(__dirname, '../docs/HasNoMeta.md');
		await expect(parser.parse('does.not.matter')).resolves.toBeNull();
	});
});
