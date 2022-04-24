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


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() {
		this.explorer?.restoreTitles();
		this.graphObserver?.onUnload();
	}

	async saveSettings(): Promise<void>{
		console.log('changes');
		return this.saveData(this.settings.getAll());
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

