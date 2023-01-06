import { DropdownComponent, Setting, TextComponent } from "obsidian";
import AbstractBuilder from "../AbstractBuilder";
import { injectable } from "inversify";
import { SettingsType } from "@src/Settings/SettingsType";

@injectable()
export default class RulesDelimiterBuilder extends AbstractBuilder<SettingsType["rules"], "delimiter"> {
    private setting: Setting = null;
    private text: TextComponent = null;
    support(k: "delimiter" | "paths"): boolean {
        return k === "delimiter";
    }
    doBuild(): void {
        this.setting = new Setting(this.container)
            .setName("List values")
            .setDesc("Set the rule about how to process list values");
        this.buildDropdown();
        this.buildText();
    }

    private buildDropdown(): void {
        const enabled = this.item.get("enabled");
        new DropdownComponent(this.setting.controlEl)
            .addOptions({ N: "Use first value", Y: "Join all by delimiter" })
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
        return this.isEnabled() ? "Type a delimiter" : "First value will be used";
    }

    private isEnabled(): boolean {
        return this.item.get("enabled").value();
    }
}
