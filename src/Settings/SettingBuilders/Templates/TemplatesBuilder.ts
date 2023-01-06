import { SettingsType } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Setting } from "obsidian";
import { injectable } from "inversify";

@injectable()
export default class TemplatesBuilder extends AbstractBuilder<SettingsType, "templates"> {
    support(k: keyof SettingsType): boolean {
        return k === "templates";
    }

    doBuild(): void {
        this.buildTemplate();
        this.buildFallbackTemplate();
    }

    private buildTemplate(): void {
        new Setting(this.container)
            .setName("Template")
            .setDesc(
                `Set a yaml path, which value will be used as a file title. Value must be string or numeric. Also you can use template-like path using "{{ }}".
    Also you can use #heading to use first Heading from a file or _basename and another reserved words. 
    See Readme to find out more`
            )
            .addText(text =>
                text
                    .setPlaceholder("Type a template")
                    .setValue(this.item.value()?.[0] ?? "")
                    .onChange(async value => this.item.value().splice(0, 1, value))
            );
    }

    private buildFallbackTemplate(): void {
        new Setting(this.container)
            .setName("Template fallback")
            .setDesc("This template will be used as a fallback option if the main template is not resolved")
            .addText(text =>
                text
                    .setPlaceholder("Type a template")
                    .setValue(this.item.value()?.[1] ?? "")
                    .onChange(v => this.item.value().splice(1, 1, v))
            );
    }
}
