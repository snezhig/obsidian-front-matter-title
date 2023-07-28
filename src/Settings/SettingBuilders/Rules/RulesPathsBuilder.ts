import { SettingsType } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Setting } from "obsidian";
import { injectable } from "inversify";
import { t } from "../../../i18n/Locale";

@injectable()
export default class RulesPathsBuilder extends AbstractBuilder<SettingsType["rules"], "paths"> {
    private settings: Setting = null;

    doBuild(): void {
        this.settings = new Setting(this.container)
            .setName(t("rule.path.name"))
            .addDropdown(e =>
                e
                    .addOptions({ white: t("rule.path.white.name"), black: t("rule.path.black.name") })
                    .setValue(this.item.get("mode").value())
                    .onChange(e => {
                        this.item.get("mode").set(e as "white" | "black");
                        this.updateDesc();
                    })
            )
            .addTextArea(e =>
                e
                    .setValue(this.item.get("values").value().join("\n"))
                    .onChange(e => this.item.get("values").set(e.split("\n").filter(e => e)))
            );
        this.updateDesc();
    }

    support(k: "paths" | "delimiter"): boolean {
        return k === "paths";
    }

    private updateDesc(): void {
        const descriptions = {
            white: t("rule.path.white.desc"),
            black: t("rule.path.black.desc"),
        };
        this.settings.setDesc(descriptions[this.item.get("mode").value()]);
    }
}
