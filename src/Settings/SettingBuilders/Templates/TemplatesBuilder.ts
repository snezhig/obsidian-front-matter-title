import { SettingsType } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Setting } from "obsidian";
import { inject, injectable } from "inversify";
import { ObsidianModalFactory } from "@config/inversify.factory.types";
import SI from "../../../../config/inversify.types";
import { GITHUB_DOCS } from "@src/Enum";
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
            .setName(this.createDocFragment(t("template.common.main.name")))
            .setDesc(t("template.common.main.desc"))
            .addText(text =>
                text
                    .setPlaceholder(t("template.placeholder"))
                    .setValue(this.item.get("common").get("main").value() ?? "")
                    .onChange(async value => this.item.get("common").get("main").set(value))
            );
    }

    private buildFallbackTemplate(): void {
        new Setting(this.container)
            .setName(this.createDocFragment(t("template.common.fallback.name")))
            .setDesc(t("template.common.fallback.desc"))
            .addText(text =>
                text
                    .setPlaceholder(t("template.placeholder"))
                    .setValue(this.item.get("common").get("fallback").value() ?? "")
                    .onChange(async value => this.item.get("common").get("fallback").set(value))
            );
    }
}
