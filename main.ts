import "reflect-metadata";

import { AppExt, CachedMetadata, Modal, Notice, Plugin } from "obsidian";
import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import SettingsTab from "@src/Settings/SettingsTab";
import Storage from "@src/Storage/Storage";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import { interfaces } from "inversify";
import App from "@src/App";
import { AppEvents } from "@src/Types";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import Event from "@src/Components/EventDispatcher/Event";
import PluginHelper from "@src/Utils/PluginHelper";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { Feature } from "@src/Enum";
import ObjectHelper from "@src/Utils/ObjectHelper";
import FeatureComposer from "@src/Feature/FeatureComposer";
import ManagerComposer from "@src/Feature/ManagerComposer";
import { ObsidianMetaFactory } from "@config/inversify.factory.types";
import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { PluginInterface } from "front-matter-plugin-api-provider";
import Defer, { DeferFeaturesReady, DeferPluginReady } from "@src/Components/ApiAdapter/Defer";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { t } from "@src/i18n/Locale";
import { Migrator } from "@src/Migrator/Migrator";

declare const PLUGIN_VERSION: string;
export default class MetaTitlePlugin extends Plugin implements PluginInterface {
    private dispatcher: EventDispatcherInterface<AppEvents & ResolverEvents & SettingsEvent>;
    private container: interfaces.Container = Container;
    private storage: Storage<SettingsType>;
    private logger: LoggerInterface;
    private fc: FeatureComposer;
    private mc: ManagerComposer;

    public getDefer(): Defer {
        return this.container.get(SI.defer);
    }

    public async onload() {
        this.bindServices();
        this.dispatcher = this.container.get(SI["event:dispatcher"]);
        this.logger = this.container.getNamed(SI.logger, "main");

        this.app.workspace.on("layout-change", () => this.dispatcher.dispatch("layout:change", null));
        this.app.workspace.on("active-leaf-change", () => this.dispatcher.dispatch("active:leaf:change", null));
        this.app.workspace.on("file-open", file => this.dispatcher.dispatch("file:open", new Event(file)));
        new App(); //replace with static
        this.container.getAllNamed<ListenerInterface>(SI.listener, "unnamed").map(e => e.bind());
        await this.loadSettings();
        this.app.workspace.onLayoutReady(() => this.getDefer().setFlag(DeferPluginReady));
        await this.delay();

        this.fc = Container.get(SI["feature:composer"]);
        this.mc = Container.get(SI["manager:composer"]);
        this.bind();
        this.registerCommands();
    }

    public onunload() {
        this.fc.disableAll();
    }

    private async loadSettings(): Promise<void> {
        const loaded = await this.loadData();
        if (loaded && !loaded.version) {
            loaded.version = "0.0.0";
        }
        let data = ObjectHelper.fillFrom(PluginHelper.createDefaultSettings(), loaded ?? {});
        data = new Migrator(data, this.dispatcher).migrate(PLUGIN_VERSION);
        data.version = PLUGIN_VERSION;
        this.storage = new Storage<SettingsType>(data);
        this.container.bind<Storage<SettingsType>>(SI["settings:storage"]).toConstantValue(this.storage);
        this.addSettingTab(this.container.resolve(SettingsTab).getTab());
    }

    private async onSettingsChange(settings: SettingsType): Promise<void> {
        await this.saveData(settings);
        this.reloadFeatures();
        await this.mc.refresh();
    }

    private async delay(): Promise<void> {
        const delay = this.storage.get("boot").get("delay").value();
        this.logger.log(`Plugin manual delay ${delay}`);
        await new Promise(r => setTimeout(r, delay));
    }

    private bindServices(): void {
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
        Container.bind<ObsidianFacade>(SI["facade:obsidian"]).toConstantValue(new ObsidianFacade(this.app as AppExt));

        Container.bind<ObsidianMetaFactory>(SI["factory:metadata:cache"]).toFunction(() => this.app.metadataCache);
        Container.bind(SI["obsidian:app"]).toConstantValue(this.app);
        Container.bind(SI["obsidian:plugin"]).toConstantValue(this);
        Container.bind(SI["newable:obsidian:chooser"]).toConstructor(
            //@ts-ignore
            Object.getPrototypeOf(this.app.workspace.editorSuggest.suggests[0].suggestions).constructor
        );
        Container.bind(SI["factory:obsidian:active:file"]).toFunction(() => this.app.workspace.getActiveFile());
        Container.bind(SI["factory:obsidian:modal"]).toFunction(() => new Modal(this.app));
    }

    private bind() {
        this.registerEvent(
            this.app.metadataCache.on("changed", (file, _, cache) =>
                this.dispatcher.dispatch("metadata:cache:changed", new Event({ path: file.path, cache }))
            )
        );
        this.app.workspace.onLayoutReady(async () => {
            this.registerEvent(
                this.app.vault.on("rename", ({ path: actual }, old) =>
                    this.dispatcher.dispatch("file:rename", new Event({ old, actual }))
                )
            );
            this.reloadFeatures();
            await this.mc.refresh();
            this.getDefer().setFlag(DeferFeaturesReady);
        });
        this.dispatcher.addListener({
            name: "resolver:unresolved",
            cb: e => this.mc.update(e.get().path).catch(console.error),
        });

        this.dispatcher.addListener({ name: "settings:changed", cb: e => this.onSettingsChange(e.get().actual) });
    }

    private reloadFeatures(): void {
        this.fc.disableAll();
        const f = this.storage.get("features");
        const states = [];

        for (const feature of Object.values(Feature)) {
            states.push([feature, f.get(feature).get("enabled").value()]);
        }

        for (const [id, state] of states) {
            try {
                this.fc.toggle(id, state as boolean);
            } catch (e) {
                //TODO: refactor
                this.fc.toggle(id, false);
                new Notice(e);
            }
        }
    }

    private registerCommands(): void {
        this.addCommand({
            id: "ofmt-features-stop",
            name: t("command.features.disable"),
            callback: () => this.fc.disableAll(),
        });
        this.addCommand({
            id: "ofmt-features-reload",
            name: t("command.features.reload"),
            callback: () => {
                this.reloadFeatures();
                this.mc.refresh().catch(console.error);
            },
        });
    }
}
