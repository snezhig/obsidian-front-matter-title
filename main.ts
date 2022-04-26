import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	TFileExplorer
} from 'obsidian';
import FileTitleResolver from "./src/FileTitleResolver";
import FileExplorerTitles from "./src/FileExplorerTitles";
import GraphObserver from "./src/GraphObserver";
import {Settings, SettingsTab} from "./src/Settings";
import {debounce} from "ts-debounce";
// Remember to rename these classes and interfaces!


export default class MetaTitle extends Plugin {
	settings: Settings;
	resolver: FileTitleResolver;
	explorer: FileExplorerTitles;
	graphObserver: GraphObserver;


	register(cb: () => any) {
		super.register(cb);
	}

	async initExplorer(): Promise<void> {
		const leaves = this.app.workspace.getLeavesOfType('file-explorer');
		if (leaves.length > 1) {
			//TODO: Exception
		}
		if (leaves?.[0]?.view === undefined) {
			console.log('undef');
			return;
		}
		const explorer = (leaves?.[0]?.view) as TFileExplorer;

		this.explorer = new FileExplorerTitles(explorer, this.resolver);
		await this.explorer.initTitles();
	}


	bind() {
		this.registerEvent(this.app.vault.on('modify', file => {
			console.log(file);
			this.resolver?.handleModify(file);
			this.explorer?.updateTitle(file).catch(console.error);
		}));

		this.registerEvent(this.app.workspace.on('layout-change', () => {
			this.graphObserver?.handleLayoutChange();
		}));
	}


	async onload() {

		this.settings = new Settings(await this.loadData());
		this.bind();
		this.resolver = new FileTitleResolver(this.app.vault, {metaPath: this.settings.get('path')});
		this.graphObserver = new GraphObserver(this.app.workspace, this.resolver);
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
		this.graphObserver?.onUnload();
	}

	saveSettings = debounce(
		async () => {
			await this.saveData(this.settings.getAll());
			this.resolver.setMetaPath(this.settings.get('path'));
			await this.explorer.initTitles();
		},
		1000
	);
}
