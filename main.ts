import {debounce, Debouncer, Plugin, TAbstractFile, TFileExplorerView} from 'obsidian';
import Resolver from "./src/Title/Resolver/Resolver";
import ExplorerManager from "./src/Title/Manager/ExplorerManager";
import GraphManager from "./src/Title/Manager/GraphManager";
import {Settings, SettingsTab} from "./src/Settings";
import Manager from "./src/Title/Manager/Manager";

type ManagerType = 'graph' | 'explorer';

export default class MetaTitlePlugin extends Plugin {
    public settings: Settings;
    private resolver: Resolver;
    private managers: Map<ManagerType, Manager> = new Map();

    private get graph(): Manager | null {
        return this.managers.get('graph') ?? null;
    }

    private get explorer(): Manager | null {
        return this.managers.get('explorer') ?? null;
    }

    public async saveSettings() {
        const settings = this.settings.getAll();
        await this.saveData(settings);
        this.resolver.setMetaPath(settings.path);
        this.resolver.setExcluded(settings.excluded_folders);
        this.toggleGraph(settings.graph_enabled)
        await this.toggleExplorer(settings.explorer_enabled);
    }

    public async onload() {
        this.saveSettings = debounce(this.saveSettings, 500, true) as unknown as () => Promise<void>

        this.settings = new Settings(await this.loadData());
        this.bind();

        this.resolver = new Resolver(this.app.metadataCache, {
            metaPath: this.settings.get('path'),
            excluded: this.settings.get('excluded_folders')
        });
        this.resolver.on('unresolved', debounce(() => this.onUnresolvedHandler(), 200));

        this.app.workspace.onLayoutReady(() => {
            this.toggleGraph(this.settings.get('graph_enabled'));
            this.toggleExplorer(this.settings.get('explorer_enabled'));
        });

        this.addSettingTab(new SettingsTab(this.app, this));
    }

    public onunload() {
        this.managers.forEach(e => e.disable());
        this.resolver.removeAllListeners('unresolved');
    }

    private getExplorerView(): TFileExplorerView | null {
        const leaves = this.app.workspace.getLeavesOfType('file-explorer');

        if (leaves.length > 1) {
            //TODO: error? Try to work with more than one explorer?
            console.log('there is more then one explorer')
            return null;
        }

        //TODO: what if it be later?
        if (leaves?.first()?.view === undefined) {
            console.log('explorer is undefined');
            return null;
        }

        return leaves.first().view as TFileExplorerView;
    }

    private async toggleExplorer(state: boolean = true): Promise<void> {
        if (state && !this.explorer) {
            const view = this.getExplorerView();
            this.managers.set('explorer', new ExplorerManager(view, this.resolver));
            this.explorer.enable();
            await this.explorer.update();
        } else if (!state && this.explorer) {
            this.explorer.disable();
            this.managers.delete('explorer');
        }
    }

    private toggleGraph(state: boolean = true): void {
        if (state && !this.graph) {
            this.managers.set('graph', new GraphManager(this.app.workspace, this.resolver));
            this.graph.enable();
            this.graph.update().catch(console.error);
        } else if (!state && this.graph) {
            this.graph.disable();
            this.managers.delete('graph');
        }
    }

    private bind() {
        this.registerEvent(this.app.metadataCache.on('changed', file => {
            this.resolver?.revoke(file);
            this.runManagersUpdate(file).catch(console.error)
        }));


        const initGraph = () => {
            if (!this.graph || this.graph.isEnabled()) {
                return;
            }
            this.graph.enable();

            if (this.graph.isEnabled()) {
                this.graph.update().catch(console.error);
            } else if (this.app.workspace.getLeavesOfType('graph').length) {
                setTimeout(initGraph.bind(this), 20);
            }
        }

        this.registerEvent(this.app.workspace.on('layout-change', initGraph));
    }

    private async runManagersUpdate(fileOrPath: TAbstractFile = null): Promise<void> {
        const promises = [];
        for (const manager of this.managers.values()) {
            promises.push(manager.update(fileOrPath));
        }
        await Promise.all(promises);
    }


    private async onUnresolvedHandler(): Promise<void> {
        await this.runManagersUpdate();
    }
}
