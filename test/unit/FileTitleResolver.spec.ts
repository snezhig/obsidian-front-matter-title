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

Vault.prototype.getAbstractFileByPath = (path: string) => {
	const file = new TFile();
	file.path = path;
	file.basename = `mock_${path}_basename`
	file.vault = new Vault();
	return file;
};


const Options = {
	metaPath: 'title'
};
const vault = new Vault();
let resolver = new FileTitleResolver(vault, Options);

beforeEach(() => {
	jest.clearAllMocks();
	parse.mockClear();
})

describe('File Title Resolver Test', () => {

	describe('Test options', () => {
		const meta: { [s: string]: string } = {
			title: 'simple_title',
		};

		beforeEach(() => {
			parse.mockImplementationOnce(async (path: string) => {
				return meta[path] ?? null;
			})
		})

		const testTitleIsEqual = (title: string) => expect(title).toEqual(meta[Options.metaPath]);

		test('Parse called with meta path and null and returns title', async () => {
			const title = await resolver.resolveTitle(Math.random().toString());
			expect(parse).toHaveBeenCalledWith(Options.metaPath, null);
			testTitleIsEqual(title);
		})

		test('Resolve return null', async () => {
			Options.metaPath = 'not.exists.path';
			const title = await resolver.resolveTitle(Math.random().toString());
			expect(title).toBeNull();
		})
	})


	describe('Title multiple resolving', () => {
		let title: string = null;
		const path = 'mock_path';
		const testResolved = async () => {
			expect(await resolver.resolveTitle(path)).toEqual(title);
			expect(parse).not.toHaveBeenCalled();
		};
		const testAfterEvent = async () => {
			const newTitle = await resolver.resolveTitle(path);
			expect(newTitle).not.toEqual(title);
			expect(parse).toHaveBeenCalled();
			title = newTitle;
		}

		test('Parser must be called', async () => {
			title = await resolver.resolveTitle(path);
			expect(parse).toHaveBeenCalled();
		});

		test('Get title without parse', testResolved)

		test('Parse after edit', async () => {
			vault.trigger('modify', vault.getAbstractFileByPath(path));
			await testAfterEvent();
		})

		test('Get title without parse after edit', testResolved)

		test('Parse after delete', async () => {
			vault.trigger('delete', vault.getAbstractFileByPath(path));
			await testAfterEvent()
		});

		test('Get title without parse after edit', testResolved)
	});

	describe('Test concurrent resolving', () => {
		let resolve = null;
		const path = 'concurrent';
		beforeEach(() => {
			parse.mockImplementationOnce(async () => new Promise(r => resolve = r));
		})

		test('Title is not resolved and returns null', () => {
			expect(resolver.isResolved(path)).toBeFalsy();
			expect(resolver.getResolved(path)).toBeNull();
		})

	})
});
