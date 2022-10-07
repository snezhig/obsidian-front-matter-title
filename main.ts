import { CachedMetadata, Plugin, TAbstractFile } from "obsidian";
import Composer, { ManagerType } from "./src/Title/Manager/Composer";
import MComposer from "./src/Managers/Composer";
import { SettingsEvent, SettingsFeatures, SettingsType } from "@src/Settings/SettingsType";
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
import { Feature, Manager } from "@src/enum";
import FeatureToggle from "@src/Managers/Features/FeatureToggle";
import ObjectHelper from "@src/Utils/ObjectHelper";
import { BindDeffer, getDeffer, Plugin as ApiPlugin } from "front-matter-plugin-api-provider";
import Deffer, { DefferBooted, DefferBound } from "@src/Api/Deffer";

export default class MetaTitlePlugin extends Plugin implements ApiPlugin {
    private dispatcher: DispatcherInterface<AppEvents & ResolverEvents & SettingsEvent>;
    private composer: Composer = null;
    private container: interfaces.Container = Container;
    private storage: Storage<SettingsType>;
    private logger: LoggerInterface;
    private c: MComposer;
    private featureToggle: FeatureToggle;

    public getDeffer(): BindDeffer {
        return this.container.get(SI.deffer);
    }

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
        this.addSettingTab(new SettingsTab(this.app, this, this.storage, this.dispatcher));
    }

    private async onSettingsChange(settings: SettingsType): Promise<void> {
        await this.saveData(settings);
        this.composer.setState(settings.managers.header, ManagerType.Graph);
        this.composer.setState(settings.managers.header, ManagerType.Markdown);
        this.composer.setState(settings.managers.quick_switcher, ManagerType.QuickSwitcher);
        await this.processFeatures(settings.features);
        await this.processManagers();
        await this.runManagersUpdate();
    }

    public async onload() {
        const deffer = getDeffer(this.app);
        const path = "path/to/file.md";
        if (!deffer.isBound()) {
            //After this API object will be available by deffer.getApi();
            const bootDeffer = await deffer.awaitBind();
            //This is optional. Do this if you want to wait until plugin run all its managers.
            await bootDeffer.awaitBoot();
        }
        const api = deffer.getApi();

        //Resolve title asynchronously
        const title = await api.resolve(path);
        console.log(title);

        //Resolve title synchronously
        const titleSync = api.resolveSync(path);
        console.log(titleSync);

        this.bindServices();
        this.dispatcher = this.container.get(SI.dispatcher);
        this.logger = this.container.getNamed(SI.logger, "main");
        new App();
        await this.loadSettings();
        this.container.get<Deffer>(SI.deffer).setFlag(DefferBound);

        const delay = this.storage.get("boot").get("delay").value();
        this.logger.log(`Plugin manual delay ${delay}`);
        await new Promise(r => setTimeout(r, delay));

        this.composer = new Composer(
            this.app.workspace,
            this.container.getNamed<ResolverInterface>(SI.resolver, Resolving.Sync),
            this.container.getNamed<ResolverInterface<Resolving.Async>>(SI.resolver, Resolving.Async)
        );
        this.c = Container.get(SI.composer);
        this.featureToggle = Container.get(SI.feature_toggle);
        this.bind();
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
        Container.bind<ObsidianFacade>(SI["facade:obsidian"]).toConstantValue(
            new ObsidianFacade(this.app.vault, this.app.metadataCache, this.app.workspace)
        );
        Container.bind(SI["obsidian:app"]).toConstantValue(this.app);
    }

    public onunload() {
        this.composer.setState(false);
        this.c.setState(false).catch(console.error);
        this.featureToggle.disableAll().catch(console.error);
    }

    private bind() {
        this.registerEvent(
            this.app.metadataCache.on("changed", file => {
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
            this.composer.setState(this.storage.get("managers").get(Manager.Graph).value(), ManagerType.Graph);
            this.composer.setState(this.storage.get("managers").get(Manager.Header).value(), ManagerType.Markdown);
            this.composer.setState(
                this.storage.get("managers").get(Manager.QuickSwitcher).value(),
                ManagerType.QuickSwitcher
            );
            await this.processFeatures(this.storage.get("features").value());
            await Promise.all([
                this.processManagers().catch(console.error),
                this.runManagersUpdate().catch(console.error),
            ]);
            this.container.get<Deffer>(SI.deffer).setFlag(DefferBooted);
        });

        this.dispatcher.addListener(
            "settings.changed",
            new CallbackVoid<SettingsEvent["settings.changed"]>(e => this.onSettingsChange(e.get().actual))
        );
    }

    private async processManagers(): Promise<void> {
        this.logger.log("processManagers");
        const promises = [];
        for (const [id, state] of Object.entries(this.storage.get("managers").value())) {
            promises.push(this.c.setState(state, id as Manager));
        }
        await Promise.all(promises);
    }

    private async processFeatures(options: SettingsFeatures<Feature>): Promise<void> {
        for (const [id, { enabled }] of Object.entries(options)) {
            await this.featureToggle.toggle(id as Feature, enabled).catch(console.error);
        }
    }

    private async runManagersUpdate(file: TAbstractFile = null): Promise<void> {
        this.logger.log("runManagersUpdate");
        await this.composer.update(file);
        await this.c.update(file?.path ?? null);
    }
}
