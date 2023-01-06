import { SettingsType } from "@src/Settings/SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { Setting } from "obsidian";
import { injectable } from "inversify";

@injectable()
export default class RulesPathsBuilder extends AbstractBuilder<SettingsType["rules"], "paths"> {
    private settings: Setting = null;

    doBuild(): void {
        this.settings = new Setting(this.container)
            .setName("File path rule")
            .addDropdown(e =>
                e
                    .addOptions({ white: "White list mode", black: "Black list mode" })
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
            white: "Files that are located by paths will be processed by plugin. Each path must be written with new line.",
            black: "Files that are located by paths will be ignored by plugin. Each path must be written with new line.",
        };
        this.settings.setDesc(descriptions[this.item.get("mode").value()]);
    }
}
