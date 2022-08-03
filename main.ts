import {debounce, Plugin, TAbstractFile} from 'obsidian';
import Resolver from "./src/Title/Resolver/Resolver";
import Composer, {ManagerType} from "./src/Title/Manager/Composer";
import FrontMatterParser from "./src/Title/FrontMatterParser";
import VaultFacade from "./src/Obsidian/VaultFacade";
import {SettingsEvent, SettingsType} from "@src/Settings/SettingsType";
import SettingsTab from "@src/Settings/SettingsTab";
import Storage from "@src/Settings/Storage";
import Container from "@config/inversify.config";
import Dispatcher from "@src/EventDispatcher/Dispatcher";
import TYPES from "@config/inversify.types";
import EventInterface from "@src/EventDispatcher/Interfaces/EventInterface";
import {interfaces} from "inversify";
import Callback from "@src/EventDispatcher/Callback";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import ObjectHelper from "@src/Utils/ObjectHelper";


export default class MetaTitlePlugin extends Plugin {
    private resolver: Resolver;
    private composer: Composer = null;
    private parser: FrontMatterParser;
    private container: interfaces.Container = Container;
    private storage: Storage<SettingsType>;
    private resolvers: {
        sync?: ResolverInterface<Resolving.Sync>
    } = {};

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

        this.resolver.changePath(settings.path);
        this.resolver.setExcluded(settings.excluded_folders);
        this.composer.setState(settings.m_graph, ManagerType.Graph);
        this.composer.setState(settings.m_explorer, ManagerType.Explorer);
        this.composer.setState(settings.m_markdown, ManagerType.Markdown);
        this.composer.setState(settings.m_quick_switcher, ManagerType.QuickSwitcher);
        await this.runManagersUpdate();
    }

    private get defaultSettings(): SettingsType {
        return {
            path: 'title',
            managers: {
                explorer: false,
                graph: false,
                header: false,
                quick_switcher: false
            },
            rules: {
                paths: {
                    mode: 'black',
                    values: []
                }
            }
        }
    }

    private async loadSettings(): Promise<void> {
        let data: SettingsType = this.defaultSettings;
        const current = await this.loadData();
        for (const k of Object.keys(data) as (keyof SettingsType)[]) {
            console.log(k, current[k]);
            data[k] = current[k] ?? data[k];
        }

        this.storage = new Storage<SettingsType>(data);
        const dispatcher = this.container.get<Dispatcher<SettingsEvent>>(TYPES.dispatcher);
        this.addSettingTab(new SettingsTab(this.app, this, this.storage, dispatcher));
        dispatcher.addListener('settings.changed', new Callback(e => {
            this.saveData(e.get());
            this.processSettingsChange(data, e.get());
            data = e.get();
            return e;
        }));
    }

    private processSettingsChange(old: SettingsType, actual: SettingsType): void {

        const changed = ObjectHelper.compare<SettingsType>(old, actual);
        const recreateResolvers = false;
        if (changed.path) {
            this.updateTemplate();
        }
        if (recreateResolvers) {
            this.createResolvers();
        }
    }

    private createResolvers(): void {
        this.resolvers.sync = this.container.getNamed<ResolverInterface>(TYPES.resolver, 'sync');
    }

    private updateTemplate(): void {
        this.container.rebind<string>(TYPES.template).toConstantValue(this.storage.get('path').value());
    }

    public async onload() {
        await this.loadSettings();
        this.updateTemplate();
        this.createResolvers();


        // this.saveSettings = debounce(this.saveSettings, 500, true) as unknown as () => Promise<void>
        //
        // this.settings = new Settings(await this.loadData(), this.saveSettings.bind(this));
        // this.bind();
        //
        // this.parser = new FrontMatterParser();
        // this.resolver = new Resolver(
        //     this.app.metadataCache,
        //     this.parser,
        //     new VaultFacade(this.app.vault),
        //     {
        //         metaPath: this.settings.get('path'),
        //         excluded: this.settings.get('excluded_folders')
        //     });
        // this.resolver.on('unresolved', debounce(() => this.onUnresolvedHandler(), 200));
        //
        // this.composer = new Composer(this.app.workspace, this.resolver);
        // this.app.workspace.onLayoutReady(() => {
        //     this.composer.setState(this.settings.get('m_graph'), ManagerType.Graph);
        //     this.composer.setState(this.settings.get('m_explorer'), ManagerType.Explorer);
        //     this.composer.setState(this.settings.get('m_markdown'), ManagerType.Markdown)
        //     this.composer.setState(this.settings.get('m_quick_switcher'), ManagerType.QuickSwitcher)
        //     this.composer.update();
        // });
        //
        // this.addSettingTab(new SettingsTab(this.app, this));
    }

    public onunload() {
        // this.composer.setState(false);
        // this.resolver.removeAllListeners('unresolved');
    }

    private bind() {
        this.registerEvent(this.app.metadataCache.on('changed', file => {
            this.resolver?.revoke(file);
            this.runManagersUpdate(file).catch(console.error)
        }));
        this.app.workspace.onLayoutReady(() =>
            this.registerEvent(this.app.vault.on('rename', (e, o) => {
                this.resolver?.revoke(o);
                this.runManagersUpdate(e).catch(console.error);
            }))
        );
    }


    private async runManagersUpdate(file: TAbstractFile = null): Promise<void> {
        await this.composer.update(file);
    }


    private async onUnresolvedHandler(): Promise<void> {
        await this.runManagersUpdate();
    }
}
