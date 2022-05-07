import {debounce, Plugin, TFileExplorerView} from 'obsidian';
import FileTitleResolver from "./src/FileTitleResolver";
import ExplorerTitles from "./src/Titles/ExplorerTitles";
import GraphTitles from "./src/Titles/GraphTitles";
import {Settings, SettingsTab} from "./src/Settings";
import {stat} from "fs";

export default class MetaTitlePlugin extends Plugin {
	settings: Settings;
	resolver: FileTitleResolver;
	explorer: ExplorerTitles;
	graph: GraphTitles;

	public saveSettings = debounce(
		async () => {
			const settings = this.settings.getAll();
			await this.saveData(settings);
			this.resolver.setMetaPath(settings.path);
			this.resolver.setExcluded(settings.excluded_folders);
			this.toggleGraph(settings.graph_enabled)
			await this.toggleExplorer(settings.explorer_enabled);
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

		this.toggleGraph(this.settings.get('graph_enabled'));

		this.app.workspace.onLayoutReady(() => {
			this.toggleExplorer(this.settings.get('explorer_enabled'));
		})
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	public onunload() {
		this.explorer?.restoreTitles();
		this.graph?.onUnload();
		this.resolver.removeAllListeners('unresolved');
	}

	private getExplorerView(): TFileExplorerView | null {
		const leaves = this.app.workspace.getLeavesOfType('file-explorer');

		if (leaves.length > 1) {
			console.log('there is more then one explorer')
			return null;
		}

		if (leaves?.first()?.view === undefined) {
			console.log('explorer is undefined');
			return null;
		}

		return leaves.first().view as TFileExplorerView;
	}

	private async toggleExplorer(state: boolean = true): Promise<void> {
		console.log(state)
		if (state && !this.explorer) {
			const view = this.getExplorerView();
			this.explorer = new ExplorerTitles(view, this.resolver);
			await this.explorer.initTitles();
		} else if (!state && this.explorer) {
			this.explorer.restoreTitles();
			this.explorer = null;
		}
	}

	private toggleGraph(state: boolean = true): void {
		if (state && !this.graph) {
			this.graph = new GraphTitles(this.app.workspace, this.resolver);
			this.graph.replaceNodeTextFunction();
			this.graph.forceTitleUpdate();
		} else if (!state) {
			this.graph?.onUnload();
			this.graph?.forceTitleUpdate();
			this.graph = null;
		}
	}

	private bind() {
		this.registerEvent(this.app.vault.on('modify', file => {
			this.resolver?.handleModify(file);
			this.explorer?.updateTitle(file).catch(console.error);
			this.graph?.forceTitleUpdate(file);
		}));

		let isReplaced = false;
		this.registerEvent(this.app.workspace.on('layout-change', () => {
			if(!isReplaced) {
				setTimeout(() => {
					isReplaced = this.graph?.replaceNodeTextFunction();
					this.graph?.forceTitleUpdate();
				}, 50);
			}
		}));
	}

	private async onUnresolvedHandler(): Promise<void> {
		await this.explorer.initTitles();
		this.graph?.forceTitleUpdate();
	}
}
