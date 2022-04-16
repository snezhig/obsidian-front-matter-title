import path from "path";
import FileTitleResolver from "../../src/FileTitleResolver";
import {TFile, Vault} from "obsidian";
import MetaTitleParser from "../../src/MetaTitleParser";
import {jest} from "@jest/globals";

const tFile = (() => {
	const file = new TFile();
	file.path = 'mock_path';
	file.basename = 'mock_file'
	return file;
})();

const getFile = jest.fn(() => tFile);
const parse = jest.fn(async () => (Math.random() * Math.random()).toString());
jest.mock('../../src/MetaTitleParser', () => {
	return jest.fn().mockImplementation(() => {
		return {getFile, parse}
	})
})


describe('File Title Resolver Test', () => {
	Vault.prototype.getAbstractFileByPath = () => tFile;
	const vault = new Vault();

	let Options: {
		ignoreEmpty: boolean,
		metaPath: string
	} = null;
	let resolver: FileTitleResolver = null;

	beforeEach(() => {
		Options = {
			ignoreEmpty: false,
			metaPath: 'title'
		};
		resolver = new FileTitleResolver(vault, Options);
		jest.clearAllMocks();
		parse.mockClear();
	})


	test('Parse called with meta path', async () => {
		await resolver.resolveTitle(tFile);
		expect(parse).toHaveBeenCalledWith(Options.metaPath);
	})

	test('Resolve return basename', async () => {
		parse.mockImplementationOnce(async () => '');
		const title = await resolver.resolveTitle(tFile);
		expect(title).not.toBeNull();
		expect(title).toEqual('');
	})

	test('Resolve return null', async () => {
		Options.ignoreEmpty = true;
		parse.mockImplementationOnce(async () => '');
		const title = await resolver.resolveTitle(tFile);
		expect(title).toEqual(tFile.basename);
	})


	test('Resolve, cache and update', async () => {

		const title = await resolver.resolveTitleByPath(tFile.path);
		expect(MetaTitleParser).toHaveBeenCalled();
		expect(parse).toHaveBeenCalled();

		parse.mockClear();
		expect(await resolver.resolveTitleByPath(tFile.path)).toEqual(title);
		expect(parse).not.toHaveBeenCalled();

		parse.mockClear();
		vault.trigger('modify', tFile);
		expect(await resolver.resolveTitleByPath(tFile.path)).not.toEqual(title);
		expect(parse).toHaveBeenCalled();

	});
});
