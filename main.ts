import { CachedMetadata, Plugin, TAbstractFile } from "obsidian";
import Composer, { ManagerType } from "./src/Title/Manager/Composer";
import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import SettingsTab from "@src/Settings/SettingsTab";
import Storage from "@src/Settings/Storage";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import { interfaces } from "inversify";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";
import App from "@src/App";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import Event from "@src/Components/EventDispatcher/Event";
import PluginHelper from "@src/Utils/PluginHelper";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { Feature } from "@src/enum";
import ObjectHelper from "@src/Utils/ObjectHelper";
import FeatureComposer from "@src/Feature/FeatureComposer";
import ManagerComposer from "@src/Feature/ManagerComposer";
import { ObsidianMetaFactory } from "@config/inversify.factory.types";
import ListenerInterface from "@src/Interfaces/ListenerInterface";

export default class MetaTitlePlugin extends Plugin {
    private dispatcher: DispatcherInterface<AppEvents & ResolverEvents & SettingsEvent>;
    private composer: Composer = null;
    private container: interfaces.Container = Container;
    private storage: Storage<SettingsType>;
    private logger: LoggerInterface;
    private fc: FeatureComposer;
    private mc: ManagerComposer;

    private async loadSettings(): Promise<void> {
        let data: SettingsType = {
            ...PluginHelper.createDefaultSettings(),
            ...{
                templates: ["title"],
                boot: { delay: 1000 },
            },
        };
        data = ObjectHelper.fillFrom(data, (await this.loadData()) ?? {});
        this.storage = new Storage<SettingsType>(data);
        this.addSettingTab(
            new SettingsTab(
                this.app,
                this,
                this.storage,
                this.dispatcher,
                this.container.get(SI["factory:settings:feature:builder"])
            )
        );
    }

    private async onSettingsChange(settings: SettingsType): Promise<void> {
        await this.saveData(settings);
        this.composer.setState(settings.features.graph.enabled, ManagerType.Graph);
        this.composer.setState(settings.features.header.enabled, ManagerType.Markdown);
        this.composer.setState(settings.features.quick_switcher.enabled, ManagerType.QuickSwitcher);
        await this.runManagersUpdate();
        await this.toggleFeatures();
        await this.mc.refresh();
    }

    private async delay(): Promise<void> {
        const delay = this.storage.get("boot").get("delay").value();
        this.logger.log(`Plugin manual delay ${delay}`);
        await new Promise(r => setTimeout(r, delay));
    }

    public async onload() {
        this.bindServices();
        this.dispatcher = this.container.get(SI.dispatcher);
        this.logger = this.container.getNamed(SI.logger, "main");

        new App(); //replace with static
        await this.loadSettings();
        await this.delay();

        this.composer = new Composer(
            this.app.workspace,
            this.container.getNamed<ResolverInterface>(SI.resolver, Resolving.Sync),
            this.container.getNamed<ResolverInterface<Resolving.Async>>(SI.resolver, Resolving.Async)
        );
        this.fc = Container.get(SI["feature:composer"]);
        this.mc = Container.get(SI["manager:composer"]);
        this.bind();
    }

    private bindServices(): void {
        Container.bind<Storage<SettingsType>>(SI.storage).toDynamicValue(() => this.storage);
        Container.bind<interfaces.Factory<{ [k: string]: any }>>(SI["factory:obsidian:file"]).toFactory<
            { [k: string]: any },
            [string]
        >(
            () =>
                (path: string): any =>
                    this.app.vault.getAbstractFileByPath(path)
        );
        Container.bind<interfaces.Factory<{ [k: string]: any }>>(SI["factory:obsidian:meta"]).toFactory<
            { [k: string]: any },
            [string, string]
        >(
            () =>
                (path: string, type: string): any =>
                    this.app.metadataCache.getCache(path)?.[type as keyof CachedMetadata]
        );
        Container.bind<ObsidianFacade>(SI["facade:obsidian"]).toConstantValue(
            new ObsidianFacade(this.app.vault, this.app.metadataCache, this.app.workspace)
        );
        Container.bind<ObsidianMetaFactory>(SI["factory:metadata:cache"]).toFunction(() => this.app.metadataCache);
        Container.bind(SI["obsidian:app"]).toConstantValue(this.app);
    }

    public onunload() {
        this.composer.setState(false);
    }

    private bind() {
        this.container.getAll<ListenerInterface>(SI.listener).map(e => e.bind());
        this.registerEvent(
            this.app.metadataCache.on("changed", (file, data, cache) => {
                this.dispatcher.dispatch("resolver.clear", new Event({ path: file.path }));
            })
        );
        this.app.workspace.onLayoutReady(() =>
            this.registerEvent(
                this.app.vault.on("rename", (e, o) => {
                    this.dispatcher.dispatch("resolver.clear", new Event({ path: o }));
                })
            )
        );
        this.dispatcher.addListener(
            "resolver.unresolved",
            new CallbackVoid<ResolverEvents["resolver.unresolved"]>(e => {
                const file = e.get().path ? this.app.vault.getAbstractFileByPath(e.get().path) : null;
                this.runManagersUpdate(file).catch(console.error);
            })
        );

        this.app.workspace.onLayoutReady(async () => {
            this.composer.setState(
                this.storage.get("features").get(Feature.Graph).get("enabled").value(),
                ManagerType.Graph
            );
            this.composer.setState(
                this.storage.get("features").get(Feature.Header).get("enabled").value(),
                ManagerType.Markdown
            );
            this.composer.setState(
                this.storage.get("features").get(Feature.QuickSwitcher).get("enabled").value(),
                ManagerType.QuickSwitcher
            );
            this.runManagersUpdate().catch(console.error);
            await this.toggleFeatures().catch(console.error);
            await this.mc.refresh();
        });

        this.dispatcher.addListener(
            "settings.changed",
            new CallbackVoid<SettingsEvent["settings.changed"]>(e => this.onSettingsChange(e.get().actual))
        );
    }

    private async runManagersUpdate(file: TAbstractFile = null): Promise<void> {
        this.logger.log("runManagersUpdate");
        await this.composer.update(file);
        if (file) {
            await this.mc.update(file.path);
        }
    }

    private async toggleFeatures(): Promise<void> {
        const f = this.storage.get('features');
        const states = [
            [Feature.Alias, f.get(Feature.Alias).get('enabled').value()],
            [Feature.Tab, f.get(Feature.Tab).get('enabled').value()],
            [Feature.Search, f.get(Feature.Search).get('enabled').value()],
            [Feature.Explorer, f.get(Feature.Explorer).get('enabled').value()],
            [Feature.ExplorerSort, f.get(Feature.ExplorerSort).get('enabled').value()],
            [Feature.Starred, f.get(Feature.Starred).get('enabled').value()],
        ];
        for (const [id, state] of states) {
            this.fc.toggle(id, state as boolean);
        }
    }
}
