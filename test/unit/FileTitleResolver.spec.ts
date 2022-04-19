import FileTitleResolver from "../../src/FileTitleResolver";
import {TFile, Vault} from "obsidian";
import MetaTitleParser from "../../src/MetaTitleParser";
import {jest} from "@jest/globals";

jest.mock('../../src/MetaTitleParser');
jest.spyOn<Vault, any>(Vault.prototype, 'read').mockImplementation(() => null);
//@ts-ignore
const parse = jest
	.spyOn(MetaTitleParser, "parse")
	.mockImplementation(async () => (Math.random() * Math.random()).toString());

Vault.prototype.getAbstractFileByPath = () => tFile;
const vault = new Vault();
const tFile = (() => {
	const file = new TFile();
	file.path = 'mock_path';
	file.basename = 'mock_file'
	file.vault = vault;
	return file;
})();

const Options = {
	ignoreEmpty: false,
	metaPath: 'title'
};
let resolver = new FileTitleResolver(vault, Options);

beforeEach(() => {
	jest.clearAllMocks();
	parse.mockClear();
})

describe('File Title Resolver Test', () => {

	describe('Test options', () => {
		beforeEach(() => tFile.path = Math.random().toString())

		test('Parse called with meta path and null', async () => {
			await resolver.resolveTitle(tFile);
			expect(parse).toHaveBeenCalledWith(Options.metaPath, null);
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

		afterAll(() => tFile.path = 'mock_path');
	})


	describe('Title multiple resolving', () => {
		let title: string = null;
		const testResolved = async () => {
			expect(await resolver.resolveTitleByPath(tFile.path)).toEqual(title);
			expect(parse).not.toHaveBeenCalled();
		};
		const testAfterEvent = async () => {
			const newTitle = await resolver.resolveTitleByPath(tFile.path);
			expect(newTitle).not.toEqual(title);
			expect(parse).toHaveBeenCalled();
			title = newTitle;
		}

		test('Parser must be called', async () => {
			title = await resolver.resolveTitleByPath(tFile.path);
			expect(parse).toHaveBeenCalled();
		});

		test('Get title without parse', testResolved)

		test('Parse after edit', async () => {
			vault.trigger('modify', tFile);
			await testAfterEvent();
		})

		test('Get title without parse after edit', testResolved)

		test('Parse after delete', async () => {
			vault.trigger('delete', tFile);
			await testAfterEvent()
		});

		test('Get title without parse after edit', testResolved)
	});
});
