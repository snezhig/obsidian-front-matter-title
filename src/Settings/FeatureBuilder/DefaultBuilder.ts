import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { SettingsFeatureCommon } from "@src/Settings/SettingsType";
import { Setting } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import AbstractBuilder from "./AbstractBuilder";
import { injectable } from "inversify";

@injectable()
export default class DefaultBuilder extends AbstractBuilder {
    private templateEl: HTMLDataElement;
    doBuild() {
        const { id, name, desc, settings } = this.options;
        this.context.getContainer().createEl("h5", { text: name });
        new Setting(this.context.getContainer())
            .setName(name)
            .setDesc(desc)
            .addToggle(e =>
                e.setValue(settings.enabled).onChange(v => {
                    this.setTemplateVisible(v);
                    this.context
                        .getDispatcher()
                        .dispatch("settings:tab:feature:changed", new Event({ id, value: { enabled: v } }));
                })
            );
        this.templateEl = this.context.getContainer().createDiv();
        this.setTemplateVisible(settings.enabled);
        this.addTemplateManageButton(this.templateEl, id);
    }
    private setTemplateVisible(visible: boolean): void {
        this.templateEl.hidden = !visible;
    }
}
