import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { Feature } from "@src/enum";
import { Setting } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import AbstractBuilder from "./AbstractBuilder";

export default class AliasBuilder extends AbstractBuilder<Feature.Alias> {
    build({ id, name, desc, settings }: BuildParams<Feature.Alias>): void {
        new Setting(this.context.containerEl)
            .setName(name)
            .setDesc(desc)
            .addToggle(e =>
                e.setValue(settings.enabled).onChange(v => {
                    this.context
                        .getDispatcher()
                        .dispatch(
                            "settings:tab:feature:changed",
                            new Event({ id, value: { enabled: v, strategy: "ensure" } })
                        );
                })
            );
    }
}
