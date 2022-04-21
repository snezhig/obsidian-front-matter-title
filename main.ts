import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFileExplorer} from 'obsidian';
import {parseYaml} from "obsidian";
import MetaTitleParser from "./src/MetaTitleParser";
import FileTitleResolver from "./src/FileTitleResolver";
import FileExplorerTitles from "./src/FileExplorerTitles";
import FunctionReplacer from "./src/FunctionReplacer";
import GraphObserver from "./src/GraphObserver";
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}


export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	resolver: FileTitleResolver;
	explorer: FileExplorerTitles;

	register(cb: () => any) {
		super.register(cb);
	}

	async initExplorer(): Promise<void>{
		const leaves = this.app.workspace.getLeavesOfType('file-explorer');
		if(leaves.length > 1){
			//TODO: Exception
		}
		if(leaves?.[0]?.view === undefined){
			console.log('undef');
			return;
		}
		const explorer = (leaves?.[0]?.view ) as TFileExplorer;

		this.explorer = new FileExplorerTitles(explorer, this.resolver);
		await this.explorer.initTitles();
		this.app.vault.on('modify', (f) => {
			console.debug('----modyfy----', f);
			this.explorer.updateTitle(f);
		});
	}

	async onload() {

		// const def = app.workspace.trigger;
		// app.workspace.trigger = (name: string, ...data: any[]) => {
		// 	console.log(name, data);
		// 	def.call(app.workspace, [name, ...data]);
		// }
		await this.loadSettings();
		this.resolver = new FileTitleResolver(this.app.vault, {metaPath: 'title'});

		this.app.workspace.onLayoutReady(() => {
			// this.initExplorer();
		})

		const g = new GraphObserver(this.app.workspace, this.resolver);

		// g.onLayoutChange();
		this.app.workspace.on('layout-change', () => {
			console.log('================layout-change================')
			g.onLayoutChange();
		});

return;

		// console.log(a);
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
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		this.explorer?.restoreTitles();
		//this.app.vault.off('modify');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
