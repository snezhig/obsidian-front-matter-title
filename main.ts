import {Plugin, TFileExplorer} from 'obsidian';
import FileTitleResolver from "./src/FileTitleResolver";
import ExplorerTitles from "./src/Titles/ExplorerTitles";
import GraphTitles from "./src/Titles/GraphTitles";
import {Settings, SettingsTab} from "./src/Settings";
import {debounce} from "ts-debounce";

export default class MetaTitlePlugin extends Plugin {
	settings: Settings;
	resolver: FileTitleResolver;
	explorer: ExplorerTitles;
	graph: GraphTitles;

	public saveSettings = debounce(
		async () => {
			await this.saveData(this.settings.getAll());
			this.resolver.setMetaPath(this.settings.get('path'));
			this.resolver.setExcluded(this.settings.get('excluded_folders'));
		},
		1000
	);

	public register(cb: () => any) {
		super.register(cb);
	}

	public async onload() {

		this.settings = new Settings(await this.loadData());

		this.bind();

		this.resolver = new FileTitleResolver(this.app.vault, {
			metaPath: this.settings.get('path'),
			excluded: this.settings.get('excluded_folders')
		});
		this.resolver.on('unresolved', debounce(() => this.onUnresolvedHandler(), 200));

		this.graph = new GraphTitles(this.app.workspace, this.resolver);

		this.app.workspace.onLayoutReady(this.initExplorer.bind(this))

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	public onunload() {
		this.explorer?.restoreTitles();
		this.graph?.onUnload();
		this.resolver.removeAllListeners('unresolved');
	}

	private async initExplorer(): Promise<void> {
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

	private bind() {
		this.registerEvent(this.app.vault.on('modify', file => {
			this.resolver?.handleModify(file);
			this.explorer?.updateTitle(file).catch(console.error);
			this.graph.forceTitleUpdate(file);
		}));

		this.registerEvent(this.app.workspace.on('layout-change', () => {
			this.graph?.handleLayoutChange();
		}));
	}

	private async onUnresolvedHandler(): Promise<void> {
		await this.explorer.initTitles();
		this.graph.forceTitleUpdate();
	}
}
