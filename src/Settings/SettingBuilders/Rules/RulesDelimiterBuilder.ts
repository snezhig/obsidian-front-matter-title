import { DropdownComponent, Setting, TextComponent } from "obsidian";
import AbstractBuilder from "../AbstractBuilder";
import { injectable } from "inversify";
import { SettingsType } from "@src/Settings/SettingsType";
import { t } from "../../../i18n/Locale";

@injectable()
export default class RulesDelimiterBuilder extends AbstractBuilder<SettingsType["rules"], "delimiter"> {
    private setting: Setting = null;
    private text: TextComponent = null;

    support(k: "delimiter" | "paths"): boolean {
        return k === "delimiter";
    }

    doBuild(): void {
        this.setting = new Setting(this.container).setName(t("rule.delimiter.name")).setDesc(t("rule.delimiter.desc"));
        this.buildDropdown();
        this.buildText();
    }

    private buildDropdown(): void {
        const enabled = this.item.get("enabled");
        new DropdownComponent(this.setting.controlEl)
            .addOptions({ N: t("rule.delimiter.first"), Y: t("rule.delimiter.join") })
            .setValue(enabled.value() ? "Y" : "N")
            .onChange(e => {
                enabled.set(e === "Y");
                this.text
                    .setValue("")
                    .setPlaceholder(this.getPlaceholder())
                    .setDisabled(e === "N")
                    .onChanged();
            });
    }

    private buildText(): void {
        const v = this.item.get("value");
        this.text = new TextComponent(this.setting.controlEl)
            .setValue(v.value())
            .setDisabled(!this.isEnabled())
            .setPlaceholder(this.getPlaceholder())
            .onChange(e => v.set(e));
    }

    private getPlaceholder(): string {
        return this.isEnabled() ? t("rule.delimiter.placeholder.join") : t("rule.delimiter.placeholder.first");
    }

    private isEnabled(): boolean {
        return this.item.get("enabled").value();
    }
}
