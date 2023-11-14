import FeatureBuildInterface, { BuildParams, Context } from "@src/Settings/Interface/FeatureBuildInterface";
import { SettingsFeature, SettingsFeatureCommon, SettingsType, TemplateValue } from "@src/Settings/SettingsType";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { Setting, TextComponent } from "obsidian";
import { t } from "@src/i18n/Locale";
import { Feature } from "@src/Enum";
import { ObsidianModalFactory } from "@config/inversify.factory.types";
import Storage from "@src/Storage/Storage";
import Event from "@src/Components/EventDispatcher/Event";

@injectable()
export default abstract class AbstractBuilder<
    K extends keyof SettingsFeature | SettingsFeatureCommon = SettingsFeatureCommon
> implements FeatureBuildInterface<K>
{
    private options: BuildParams<K>;
    constructor(
        @inject(SI["settings:storage"])
        private storage: Storage<SettingsType>,
        @inject(SI["factory:obsidian:modal"])
        private factory: ObsidianModalFactory
    ) {}
    protected context: Context;
    setContext(context: Context): void {
        this.context = context;
    }

    build(options: BuildParams<K>): void {
        this.options = options;
        this.doBuild();
        this.setExtraSettingContainerVisible(this.options.settings.enabled);
    }
    doBuild(): void {}

    protected dispatchChanges(): void {
        this.context
            .getDispatcher()
            .dispatch("settings:tab:feature:changed", new Event({ id: this.options.id, value: this.options.settings }));
    }

    protected buildEnable(): Setting {
        return new Setting(this.context.getContainer())
            .setName(this.options.name)
            .setDesc(this.options.desc)
            .addToggle(e =>
                e.setValue(this.options.settings.enabled).onChange(v => {
                    this.options.settings.enabled = v;
                    this.setExtraSettingContainerVisible(v);
                    this.dispatchChanges();
                })
            )
            .setClass("setting-feature-name");
    }

    private setExtraSettingContainerVisible(visible: boolean): void {
        this.getExtraSettingContainer()?.[visible ? "show" : "hide"]();
    }

    protected addTemplateManageButton(): void {
        const templateStorage = this.storage.get("templates");
        new Setting(this.getExtraSettingContainer())
            .setName(t("template.features.name"))
            .setDesc(t("template.features.desc"))
            .addButton(cb =>
                cb.setButtonText(t("manage")).onClick(() => {
                    const modal = this.factory();
                    const { contentEl } = modal;

                    for (const type of ["main", "fallback"]) {
                        const tStorage = this.storage.get("features").get(this.options.id).get("templates").get(type);
                        new Setting(contentEl)
                            .setName(t(`template.${type}`))
                            .setDesc(this.getDesc(type, tStorage.value()))
                            .addText(e => {
                                e.setValue(tStorage.value() ?? "")
                                    .setPlaceholder(templateStorage.get("common").get(type).value())
                                    .onChange(v => tStorage.set(v));
                            });
                    }

                    modal.open();
                })
            );
    }
    private getDesc(type: keyof TemplateValue, value: string | null): string {
        if (value) {
            return t("template.specific");
        } else {
            return t("template.used", { value: this.storage.get("templates").get("common").get(type).value() });
        }
    }

    protected getExtraSettingContainer(): HTMLElement | null {
        return null;
    }
}
