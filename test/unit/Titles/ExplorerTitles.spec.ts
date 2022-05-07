import ExplorerTitles from "../../../src/Titles/ExplorerTitles";
import FileTitleResolver from "../../../src/FileTitleResolver";
import {TFile, TFileExplorerView, TFileExplorerItem, Vault, WorkspaceLeaf} from "obsidian";
import {expect} from "@jest/globals";


let titles: {
	origin: string,
	resolved: string | null
};

const createItem = (text: string): TFileExplorerItem => {
	const file = new TFile();
	file.path = `${text}_path`;
	const titleInnerEl = Object.create(HTMLDivElement);
	titleInnerEl.innerText = text;
	return {file, titleInnerEl, titleEl: null}
}

const resolver = new FileTitleResolver(new Vault(), {metaPath: 'title', excluded: []});

resolver.resolve = jest.fn().mockImplementation(async () => titles.resolved);

const fileExplorer = {} as TFileExplorerView;
fileExplorer.fileItems = {};

const explorer = new ExplorerTitles(fileExplorer, resolver);


describe('Explorer Titles Test', () => {

	describe('Init and restore', () => {
		let item: TFileExplorerItem = null;

		beforeAll(() => {
			titles = {
				origin: 'init_and_restore_test_title',
				resolved: null
			}
		})

		beforeEach(() => {
			item = createItem(titles.origin);
			fileExplorer.fileItems = {[item.file.path]: item};
		})

		test('Inner text won`t be replaced because title is null', async () => {
			await explorer.initTitles();
			expect(item.titleInnerEl.innerText).toEqual(titles.origin);
		});

		test('Inner text won`t be replaced because title is empty', async () => {
			titles.resolved = '';
			await explorer.initTitles();
			expect(item.titleInnerEl.innerText).toEqual(titles.origin);
		})

		test('Inner text will be replaced with new title and restored', async () => {
			titles.resolved = 'new_title';
			await explorer.initTitles();
			expect(item.titleInnerEl.innerText).toEqual(titles.resolved);

			explorer.restoreTitles();
			expect(item.titleInnerEl.innerText).toEqual(titles.origin);
		})

	})


	describe('Replace text some times is a row', () => {

		let item: TFileExplorerItem = null;

		beforeAll(() => {
			titles = {
				origin: 'changes_in_a_row_title',
				resolved: 'resolved_title'
			};
			item = createItem(titles.origin);
			fileExplorer.fileItems = {[item.file.path]: item};
		})

		test('Inner text will be replaced', async () => {
			await explorer.updateTitle(item.file);
			expect(item.titleInnerEl.innerText).toEqual(titles.resolved);
		})

		test('Inner text is equal to previous and will be replaced again', async () => {
			expect(item.titleInnerEl.innerText).toEqual(titles.resolved);
			titles.resolved = 'new_resolved_title';
			await explorer.updateTitle(item.file);
			expect(item.titleInnerEl.innerText).toEqual(titles.resolved);
		})

		test('Inner text is equal to previous, but will be replaced with origin', async () => {
			expect(item.titleInnerEl.innerText).toEqual(titles.resolved);
			titles.resolved = null;
			await explorer.updateTitle(item.file);
			expect(item.titleInnerEl.innerText).toEqual(titles.origin);
		})
	})
})
