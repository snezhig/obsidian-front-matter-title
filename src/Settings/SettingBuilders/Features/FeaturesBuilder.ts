import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Feature, GITHUB_DOCS } from "@src/Enum";
import { SettingsFeatureBuildFactory } from "@config/inversify.factory.types";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { inject, injectable } from "inversify";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import SI from "@config/inversify.types";
import FeatureHelper from "../../../Utils/FeatureHelper";
import { t } from "../../../i18n/Locale";

@injectable()
export default class FeaturesBuilder extends AbstractBuilder<SettingsType, "features"> {
    private ref: ListenerRef<"settings:tab:feature:changed"> = null;

    constructor(
        @inject(SI["factory:settings:feature:builder"])
        private builderFactory: SettingsFeatureBuildFactory,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<SettingsEvent>,
        @inject(SI["feature:helper"])
        private helper: FeatureHelper
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
        this.container.createEl("h4", { text: t("features") });
        const data: { feature: Feature; name: string; desc: string; doc: { link: string } }[] = this.helper
            .getOrderedFeatures()
            .map(feature => ({
                desc: this.helper.getDescription(feature),
                feature,
                name: this.helper.getName(feature),
                doc: {
                    link: `${GITHUB_DOCS}/${this.helper.getDocSection(feature)}`,
                },
            }));
        for (const item of data) {
            const builder = this.builderFactory(item.feature) ?? this.builderFactory("default");
            const settings = this.item.get(item.feature).value();
            const container = this.container.createEl("details");
            container.createEl("summary", { text: item.name });
            builder.setContext({
                getContainer: () => container,
                getSettings: () => this.item.value(),
                getDispatcher: () => this.dispatcher,
            });
            builder.build({ id: item.feature, desc: item.desc, name: item.name, settings, doc: item.doc });
        }
    }
}
