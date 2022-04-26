import FileExplorerTitles from "../../src/FileExplorerTitles";
import FileTitleResolver from "../../src/FileTitleResolver";
import {TAbstractFile, TFile, TFileExplorer, TFileExplorerItem} from "obsidian";
import {expect} from "@jest/globals";
import {Arr} from "tern";


//TODO: need to refactor it, make more clearly, readable and independent

describe('new', () => {
	test('Inner text won`t be replaced because title is null', () => {

	});

	test('Inner text won`t be replaced because title is empty', () => {

	})

	test('Inner text will be replaced with new title', () => {

	})

	test('Inner text is replaces and will be restored', () => {

	})

	describe('Replace text some times is a row', () => {
		test('Inner text will be replaced', () => {

		})

		test('Inner text is equal to previous and will be replaced again', () => {

		})

		test('Inner text is equal to previous, but will be replaced with origin', () => {

		})
	})
})

describe('File Explorer Titles Test', () => {
	const titles = new Map<string, { origin: string, resolved: string, new: string }>()
		.set('null', {origin: 'just_title_null', resolved: null, new: 'just_title_null'})
		.set('empty', {origin: 'just_title_empty', resolved: '', new: 'just_title_empty'})
		.set('new', {origin: 'just_title', resolved: 'just_title_new', new: 'just_title_new'})
		.set('new_again', {origin: 'just_title_again', resolved: 'just_title_new_again', new: 'just_title_new_again'});

	const createItem = (path: string): TFileExplorerItem => {
		const file = new TFile();
		file.basename = `${path}_basename`;
		file.path = path;
		const titleEl = Object.create(HTMLDivElement);
		titleEl.innerText = titles.get(path).origin;
		return {titleEl, file}
	}


	const resolver = Object.create(FileTitleResolver) as FileTitleResolver;

	const resolve = jest.fn().mockImplementation(async (file: TFile) => titles.get(file.path).resolved);
	resolver.resolve = resolve;

	const fileExplorer = new TFileExplorer();
	fileExplorer.fileItems = Object.fromEntries<TFileExplorerItem>(Array.from(titles.keys()).map(k => [k, createItem(k)]));

	const explorer = new FileExplorerTitles(fileExplorer, resolver);


	const checkTitles = (titleKey: 'origin' | 'new') => {
		for (const [key, item] of Object.entries(fileExplorer.fileItems)) {
			expect(item.titleEl.innerText).toEqual(titles.get(key)[titleKey]);
		}
	}


	test('Titles have been updated', async () => {
		await explorer.initTitles();
		expect(resolver.resolve).toBeCalledTimes(titles.size);
		checkTitles('new');
	});

	test('Titles have been restored to origin', () => {
		explorer.restoreTitles();
		checkTitles('origin');
	})

	test('Titles must be restored after multiple updates in a row', async () => {
		await explorer.initTitles();
		await explorer.initTitles();
		checkTitles('new');
		explorer.restoreTitles();
		checkTitles('origin');
	})

	describe('Update and restore single files by one', () => {
		for (const [key, item] of titles) {
			const tFile = new TFile();
			tFile.path = key;
			const titleEl = fileExplorer.fileItems[key].titleEl;

			test(`Update title for single file ${key}`, async () => {
				expect(titleEl.innerText === item.origin);
				await explorer.updateTitle(tFile);
				expect(titleEl.innerText === item.new);
			})
		}

		test('Restore all', () => {
			explorer.restoreTitles();
			checkTitles('origin');
		})
	})

	// describe('Resolving title with meta path changes', () => {
	// 	const file = new TFile();
	// 	file.path = 'init_path';
	// 	const titleEl = Object.create(HTMLDivElement);
	// 	titleEl.innerText = file.path;
	//
	// 	fileExplorer.fileItems = Object.fromEntries([[file.path, {file, titleEl}]]);
	//
	// 	const meta: { [k: string]: string } = {
	// 		title: 'title_from_meta',
	// 		another: 'another_from_meta'
	// 	}
	// 	let path = 'title';
	//
	// 	beforeEach(() => {
	// 		resolve.mockImplementationOnce(async (): Promise<string | null> => meta?.[path] ?? null)
	// 		console.log((new Date()).toString())
	// 	})
	//
	// 	test('Title equal meta', async () => {
	// 		await explorer.initTitles();
	// 		expect(titleEl.innerText).toEqual(meta[path]);
	// 	});
	// })
})
