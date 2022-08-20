import {CachedMetadata, Plugin, TAbstractFile} from 'obsidian';
import Composer, {ManagerType} from "./src/Title/Manager/Composer";
import {SettingsEvent, SettingsType} from "@src/Settings/SettingsType";
import SettingsTab from "@src/Settings/SettingsTab";
import Storage from "@src/Settings/Storage";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import {interfaces} from "inversify";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";
import App from "@src/App";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import {AppEvents} from "@src/Types";
import {ResolverEvents} from "@src/Resolver/ResolverType";
import Event from "@src/Components/EventDispatcher/Event";
import PluginHelper from "@src/Utils/PluginHelper";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";


export default class MetaTitlePlugin extends Plugin {
    private dispatcher: DispatcherInterface<AppEvents & ResolverEvents & SettingsEvent>;
    private composer: Composer = null;
    private container: interfaces.Container = Container;
    private storage: Storage<SettingsType>;
    private logger: LoggerInterface;


    private async loadSettings(): Promise<void> {
        const data: SettingsType = {...PluginHelper.createDefaultSettings(), ...{templates: ['title']}};
        const current = await this.loadData() ?? {};
        for (const k of Object.keys(data) as (keyof SettingsType)[]) {
            //@ts-ignore
            data[k] = current[k] ?? data[k];
        }
        this.storage = new Storage<SettingsType>(data);
        this.addSettingTab(new SettingsTab(this.app, this, this.storage, this.dispatcher));
    }

    private async onSettingsChange(settings: SettingsType): Promise<void> {
        await this.saveData(settings);
        this.composer.setState(settings.managers.graph, ManagerType.Graph);
        this.composer.setState(settings.managers.explorer, ManagerType.Explorer);
        this.composer.setState(settings.managers.header, ManagerType.Markdown);
        this.composer.setState(settings.managers.quick_switcher, ManagerType.QuickSwitcher);
        await this.runManagersUpdate();
    }

    public async onload() {
        this.bindServices();
        this.dispatcher = this.container.get(SI.dispatcher);
        this.logger = this.container.getNamed(SI.logger, 'main');
        new App();
        await this.loadSettings();

        const delay = this.storage.get('boot').get('delay').value();
        this.logger.log(`Plugin manual delay ${delay}`);
        await new Promise(r => setTimeout(r, delay));

        this.composer = new Composer(
            this.app.workspace,
            this.container.getNamed<ResolverInterface>(SI.resolver, Resolving.Sync),
            this.container.getNamed<ResolverInterface<Resolving.Async>>(SI.resolver, Resolving.Async),
        );
        this.bind();
    }

    private bindServices(): void {
        Container.bind<interfaces.Factory<{ [k: string]: any }>>(SI['factory:obsidian:file'])
            .toFactory<{ [k: string]: any }, [string]>(() => (path: string): any => this.app.vault.getAbstractFileByPath(path));
        Container.bind<interfaces.Factory<{ [k: string]: any }>>(SI['factory:obsidian:meta'])
            .toFactory<{ [k: string]: any }, [string, string]>(() => (path: string, type: string): any => this.app.metadataCache.getCache(path)?.[type as keyof CachedMetadata]);
    }

    public onunload() {
        this.composer.setState(false);
    }

    private bind() {
        this.registerEvent(this.app.metadataCache.on('changed', file => {
            this.dispatcher.dispatch('resolver.clear', new Event({path: file.path}));
        }));
        this.app.workspace.onLayoutReady(() =>
            this.registerEvent(this.app.vault.on('rename', (e, o) => {
                this.dispatcher.dispatch('resolver.clear', new Event({path: o}));
            }))
        );
        this.dispatcher.addListener('resolver.unresolved', new CallbackVoid<ResolverEvents['resolver.unresolved']>(e => {
            const file = e.get().path ? this.app.vault.getAbstractFileByPath(e.get().path) : null;
            this.runManagersUpdate(file).catch(console.error);
        }))

        this.app.workspace.onLayoutReady(() => {
            this.composer.setState(this.storage.get('managers').get('graph').value(), ManagerType.Graph);
            this.composer.setState(this.storage.get('managers').get('explorer').value(), ManagerType.Explorer);
            this.composer.setState(this.storage.get('managers').get('header').value(), ManagerType.Markdown)
            this.composer.setState(this.storage.get('managers').get('quick_switcher').value(), ManagerType.QuickSwitcher)
            this.composer.update().catch(console.error);
        });

        this.dispatcher.addListener('settings.changed', new CallbackVoid<SettingsEvent['settings.changed']>(e => this.onSettingsChange(e.get().actual)));
    }


    private async runManagersUpdate(file: TAbstractFile = null): Promise<void> {
        await this.composer.update(file);
    }
}
