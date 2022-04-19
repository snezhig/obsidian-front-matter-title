import FileTitleResolver from "../../src/FileTitleResolver";
import {TFile, Vault} from "obsidian";
import MetaTitleParser from "../../src/MetaTitleParser";
import {expect, jest} from "@jest/globals";

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
	metaPath: 'title'
};

let resolver = new FileTitleResolver(vault, Options);

beforeEach(() => {
	jest.clearAllMocks();
	parse.mockClear();
})

describe('File Title Resolver Test', () => {

	describe('Test options', () => {
		const meta: {[s: string]: string} = {
			title: 'simple_title',
		};

		beforeEach(() => {
			tFile.path = Math.random().toString();
			parse.mockImplementationOnce(async (path: string) => {
				return meta[path] ?? null;
			})
		})

		const testTitleIsEqual = (title: string) => expect(title).toEqual(meta[Options.metaPath]);

		test('Parse called with meta path and null and returns title', async () => {
			const title = await resolver.resolveTitle(tFile);
			expect(parse).toHaveBeenCalledWith(Options.metaPath, null);
			testTitleIsEqual(title);
		})

		test('Resolve return null', async () => {
			Options.metaPath = 'not.exists.path';
			const title = await resolver.resolveTitle(tFile);
			expect(title).toBeNull();
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
