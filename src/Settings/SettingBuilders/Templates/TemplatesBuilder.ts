import { SettingsType, TemplateValue } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Setting } from "obsidian";
import { inject, injectable } from "inversify";
import { ObsidianModalFactory } from "@config/inversify.factory.types";
import SI from "../../../../config/inversify.types";
import { Feature, GITHUB_DOCS } from "@src/Enum";
import FeatureHelper from "../../../Utils/FeatureHelper";
import { t } from "../../../i18n/Locale";

@injectable()
export default class TemplatesBuilder extends AbstractBuilder<SettingsType, "templates"> {
    constructor(
        @inject(SI["factory:obsidian:modal"])
        private factory: ObsidianModalFactory,
        @inject(SI["feature:helper"])
        private helper: FeatureHelper
    ) {
        super();
    }

    support(k: keyof SettingsType): boolean {
        return k === "templates";
    }

    doBuild(): void {
        this.buildTemplate();
        this.buildFallbackTemplate();
        this.buildConfigButton();
    }

    private createDocFragment(text: string, section: string = null): DocumentFragment {
        return createFragment(e =>
            e.createEl("a", {
                href: GITHUB_DOCS + "Templates.md" + (section ? `#${section}` : ""),
                text,
            })
        );
    }

    private buildTemplate(): void {
        new Setting(this.container)
            .setName(this.createDocFragment(t("template.commmon.main.name")))
            .setDesc(t("template.commmon.main.desc"))
            .addText(text =>
                text
                    .setPlaceholder(t("template.placeholder"))
                    .setValue(this.item.get("common").get("main").value() ?? "")
                    .onChange(async value => this.item.get("common").get("main").set(value))
            );
    }

    private buildFallbackTemplate(): void {
        new Setting(this.container)
            .setName(this.createDocFragment(t("template.commmon.fallback.name")))
            .setDesc(t("template.commmon.fallback.desc"))
            .addText(text =>
                text
                    .setPlaceholder(t("template.placeholder"))
                    .setValue(this.item.get("common").get("fallback").value() ?? "")
                    .onChange(async value => this.item.get("common").get("fallback").set(value))
            );
    }

    private buildConfigButton(): void {
        const getDesc = (type: keyof TemplateValue, value: string | null) =>
            value ? t("template.specific") : t("template.used", { value: this.item.get("common").get(type).value() });

        new Setting(this.container)
            .setName(this.createDocFragment(t("template.features.name"), "features-templates"))
            .setDesc(t("template.features.desc"))
            .addButton(cb =>
                cb.setButtonText(t("manage")).onClick(() => {
                    const modal = this.factory();
                    const { contentEl } = modal;
                    contentEl.setText(t("template.features.name"));
                    for (const feature of Object.values(Feature)) {
                        if (feature === Feature.ExplorerSort) {
                            continue;
                        }
                        if (!this.item.get(feature)) {
                            this.item.add(feature, { main: null, fallback: null });
                        }

                        const templates = this.item.get(feature);
                        contentEl.createEl("h4", null, e => e.setText(this.helper.getName(feature)));
                        for (const type of Object.keys(templates.value()) as (keyof TemplateValue)[]) {
                            const s = new Setting(contentEl)
                                .setName(t(`template.${type}`))
                                .setDesc(getDesc(type, templates.get(type).value()))
                                .addText(text =>
                                    text
                                        .setPlaceholder(this.item.get("common").get(type).value())
                                        .setValue(templates.get(type).value())
                                        .onChange(value => {
                                            templates.get(type).set(value ? value : null);
                                            s.setDesc(getDesc(type, value));
                                        })
                                );
                        }
                    }
                    modal.open();
                })
            );
    }
}
