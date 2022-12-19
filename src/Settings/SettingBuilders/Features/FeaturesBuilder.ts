import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Feature } from "@src/enum";
import { SettingsFeatureBuildFactory } from "@config/inversify.factory.types";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { inject, injectable } from "inversify";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import SI from "@config/inversify.types";

@injectable()
export default class FeaturesBuilder extends AbstractBuilder<SettingsType, "features"> {
    private ref: ListenerRef<"settings:tab:feature:changed"> = null;
    constructor(
        @inject(SI["factory:settings:feature:builder"])
        private builderFactory: SettingsFeatureBuildFactory,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<SettingsEvent>
    ) {
        super();
    }
    support(k: keyof SettingsType): boolean {
        return k === "features";
    }

    private bind(): void {
        this.ref = this.dispatcher.addListener({
            name: "settings:tab:feature:changed",
            cb: e => this.item.get(e.get().id).set(e.get().value),
        });
        this.dispatcher.addListener({
            name: "settings:tab:close",
            cb: () => this.dispatcher.removeListener(this.ref),
            once: true,
        });
    }

    doBuild(): void {
        this.bind();
        this.container.createEl("h4", { text: "Features" });
        const data: { feature: Feature; name: string; desc: string }[] = [
            {
                feature: Feature.Alias,
                name: "Alias title",
                desc: "Modify alias in metadata cache. The real alias will not be affected.",
            },
            { feature: Feature.Explorer, name: "Explorer title", desc: "Replace shown titles in the file explorer" },
            { feature: Feature.ExplorerSort, name: "Explorer Sort", desc: "" },
            { feature: Feature.Graph, name: "Graph title", desc: "Replace shown titles in the graph/local-graph" },
            {
                feature: Feature.Header,
                name: "Header title",
                desc: "Replace titles in header of leaves and update them",
            },
            {
                feature: Feature.Starred,
                name: "Starred",
                desc: "Replace shown titles in starred plugin",
            },
            {
                feature: Feature.Search,
                name: "Search",
                desc: "Replace shown titles in search leaf",
            },
            {
                feature: Feature.Suggest,
                name: "Suggest",
                desc: "Replace shown titles in suggest modals",
            },
            {
                feature: Feature.Tab,
                name: "Tabs",
                desc: "Replace shown titles in tabs",
            },
        ];
        for (const item of data) {
            const builder = this.builderFactory(item.feature) ?? this.builderFactory("default");
            const settings = this.item.get(item.feature).value();
            builder.setContext({
                getContainer: () => this.container,
                getSettings: () => this.item.value(),
                getDispatcher: () => this.dispatcher,
            });
            builder.build({ id: item.feature, desc: item.desc, name: item.name, settings });
        }
    }
}
