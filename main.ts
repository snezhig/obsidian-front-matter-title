import {
	Editor,
	MarkdownView,
	Plugin,
	TFileExplorer
} from 'obsidian';
import FileTitleResolver from "./src/FileTitleResolver";
import ExplorerTitles from "./src/Titles/ExplorerTitles";
import GraphTitles from "./src/Titles/GraphTitles";
import {Settings, SettingsTab} from "./src/Settings";
import {debounce} from "ts-debounce";
// Remember to rename these classes and interfaces!


export default class MetaTitle extends Plugin {
	settings: Settings;
	resolver: FileTitleResolver;
	explorer: ExplorerTitles;
	graph: GraphTitles;


	register(cb: () => any) {
		super.register(cb);
	}

	async initExplorer(): Promise<void> {
		const leaves = this.app.workspace.getLeavesOfType('file-explorer');
		if (leaves.length > 1) {
			console.log('there is more then one explorer')
		}
		if (leaves?.[0]?.view === undefined) {
			console.log('explorer is undefined');
			return;
		}
		const explorer = (leaves?.[0]?.view) as TFileExplorer;

		this.explorer = new ExplorerTitles(explorer, this.resolver);
		await this.explorer.initTitles();
	}


	bind() {
		this.registerEvent(this.app.vault.on('modify', file => {
			this.resolver?.handleModify(file);
			this.explorer?.updateTitle(file).catch(console.error);
			this.graph.forceTitleUpdate(file);
		}));

		this.registerEvent(this.app.workspace.on('layout-change', () => {
			this.graph?.handleLayoutChange();
		}));
	}


	async onload() {

		this.settings = new Settings(await this.loadData());
		this.bind();
		this.resolver = new FileTitleResolver(this.app.vault, {metaPath: this.settings.get('path')});
		this.graph = new GraphTitles(this.app.workspace, this.resolver);
		this.app.workspace.onLayoutReady(() => {
			this.initExplorer();
		})

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() {
		this.explorer?.restoreTitles();
		this.graph?.onUnload();
	}

	saveSettings = debounce(
		async () => {
			await this.saveData(this.settings.getAll());
			this.resolver.setMetaPath(this.settings.get('path'));
			await this.explorer.initTitles();
			this.graph.forceTitleUpdate();
		},
		1000
	);
}
