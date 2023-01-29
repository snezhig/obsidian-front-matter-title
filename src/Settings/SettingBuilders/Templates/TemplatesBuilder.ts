import { SettingsType, TemplateValue } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Modal, Setting } from "obsidian";
import { inject, injectable } from "inversify";
import { ObsidianModalFactory } from "../../../../config/inversify.factory.types";
import SI from "../../../../config/inversify.types";
import { Feature } from "../../../enum";

@injectable()
export default class TemplatesBuilder extends AbstractBuilder<SettingsType, "templates"> {
    constructor(
        @inject(SI["factory:obsidian:modal"])
        private factory: ObsidianModalFactory
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

    private buildTemplate(): void {
        new Setting(this.container)
            .setName("Common main template")
            .setDesc(
                `Set a yaml path, which value will be used as a file title. Value must be string or numeric. Also you can use template-like path using "{{ }}".
    Also you can use #heading to use first Heading from a file or _basename and another reserved words. 
    See Readme to find out more`
            )
            .addText(text =>
                text
                    .setPlaceholder("Type a template")
                    .setValue(this.item.get("common").get("main").value() ?? "")
                    .onChange(async value => this.item.get("common").get("main").set(value))
            );
    }

    private buildFallbackTemplate(): void {
        new Setting(this.container)
            .setName("Common fallback template")
            .setDesc("This template will be used as a fallback option if the main template is not resolved")
            .addText(text =>
                text
                    .setPlaceholder("Type a template")
                    .setValue(this.item.get("common").get("fallback").value() ?? "")
                    .onChange(async value => this.item.get("common").get("fallback").set(value))
            );
    }

    private buildConfigButton(): void {
        const getDesc = (type: keyof TemplateValue, value: string | null) =>
            value
                ? `Current template will be used as ${type} for this feature`
                : `Common ${type} will be used. Its value is "${this.item.get("common").get(type).value()}"`;

        new Setting(this.container).setName("Managers`s templates").addButton(cb =>
            cb.setButtonText("Manage").onClick(() => {
                const modal = this.factory();
                const { contentEl } = modal;
                contentEl.setText("Manager`s templates");
                for (const feature of Object.values(Feature)) {
                    if (feature === Feature.ExplorerSort) {
                        continue;
                    }
                    if (!this.item.get(feature)) {
                        this.item.add(feature, { main: null, fallback: null });
                    }

                    const templates = this.item.get(feature);
                    contentEl.createEl("h4", null, e => e.setText(feature[0].toUpperCase() + feature.substring(1)));
                    for (const type of Object.keys(templates.value()) as (keyof TemplateValue)[]) {
                        const s = new Setting(contentEl)
                            .setName(type[0].toUpperCase() + type.substring(1))
                            .setDesc(getDesc(type, templates.get(type).value()))
                            .addText(text =>
                                text
                                    .setPlaceholder(`Common ${type} is used`)
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
