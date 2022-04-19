import FileExplorerTitles from "../../src/FileExplorerTitles";
import FileTitleResolver from "../../src/FileTitleResolver";
import {TAbstractFile, TFile, TFileExplorer, TFileExplorerItem} from "obsidian";
import {expect} from "@jest/globals";
import {Arr} from "tern";


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

	const resolveTitle = jest.fn().mockImplementation(async (file: TFile) => titles.get(file.path).resolved);
	resolver.resolveTitle = resolveTitle;

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
		expect(resolveTitle).toBeCalledTimes(titles.size);
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


})
