import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { SettingsFeatureCommon } from "@src/Settings/SettingsType";
import { Setting } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import AbstractBuilder from "./AbstractBuilder";

export default class DefaultBuilder extends AbstractBuilder {
    build({ id, name, desc, settings }: BuildParams<SettingsFeatureCommon>) {
        this.context.getContainer().createEl("h5", { text: name });
        new Setting(this.context.getContainer())
            .setName(name)
            .setDesc(desc)
            .addToggle(e =>
                e.setValue(settings.enabled).onChange(v => {
                    this.context
                        .getDispatcher()
                        .dispatch("settings:tab:feature:changed", new Event({ id, value: { enabled: v } }));
                })
            );
    }
}
