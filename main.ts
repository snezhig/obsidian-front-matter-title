import {debounce, Plugin, TAbstractFile} from 'obsidian';
import Resolver from "./src/Title/Resolver/Resolver";
import {Settings, SettingsTab} from "./src/Settings";
import Composer from "./src/Title/Manager/Composer";
import {Leaves} from "./src/enum";
import FrontMatterParser from "./src/Title/FrontMatterParser";


export default class MetaTitlePlugin extends Plugin {
    public settings: Settings;
    private resolver: Resolver;
    private composer: Composer = null;
    private parser: FrontMatterParser;


    public async saveSettings() {
        const settings = this.settings.getAll();
        await this.saveData(settings);

        //TODO: refactor
        if (
            settings.list_pattern === true && this.parser.getDelimiter() !== null
            || settings.list_pattern !== true && settings.list_pattern !== this.parser.getDelimiter()
        ) {
            this.parser.setDelimiter(settings.list_pattern === true ? null : settings.list_pattern);
            this.resolver.revokeAll();
        }

        this.resolver.setMetaPath(settings.path);
        this.resolver.setExcluded(settings.excluded_folders);

        this.composer.setState(settings.m_graph, Leaves.G);
        this.composer.setState(settings.m_explorer, Leaves.FE);
        this.composer.setState(settings.m_markdown, Leaves.MD);
        await this.runManagersUpdate();
    }

    public async onload() {
        this.saveSettings = debounce(this.saveSettings, 500, true) as unknown as () => Promise<void>

        this.settings = new Settings(await this.loadData(), this.saveSettings.bind(this));
        this.bind();

        this.parser = new FrontMatterParser();
        this.resolver = new Resolver(
            this.app.metadataCache,
            this.parser,
            {
                metaPath: this.settings.get('path'),
                excluded: this.settings.get('excluded_folders')
            });
        this.resolver.on('unresolved', debounce(() => this.onUnresolvedHandler(), 200));

        this.composer = new Composer(this.app.workspace, this.resolver);
        this.app.workspace.onLayoutReady(() => {
            this.composer.setState(this.settings.get('m_graph'), Leaves.G);
            this.composer.setState(this.settings.get('m_explorer'), Leaves.FE);
            this.composer.setState(this.settings.get('m_markdown'), Leaves.MD)
            this.composer.update();
        });

        this.addSettingTab(new SettingsTab(this.app, this));
    }

    public onunload() {
        this.composer.setState(false);
        this.resolver.removeAllListeners('unresolved');
    }

    private bind() {
        this.registerEvent(this.app.metadataCache.on('changed', file => {
            this.resolver?.revoke(file);
            this.runManagersUpdate(file).catch(console.error)
        }));
        this.registerEvent(this.app.vault.on('rename', (e, o) => {
            this.resolver?.revoke(o);
            this.runManagersUpdate(e).catch(console.error);
        }));
    }


    private async runManagersUpdate(file: TAbstractFile = null): Promise<void> {
        await this.composer.update(file);
    }


    private async onUnresolvedHandler(): Promise<void> {
        await this.runManagersUpdate();
    }
}
