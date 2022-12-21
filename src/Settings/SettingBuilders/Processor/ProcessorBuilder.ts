import { Setting, TextComponent } from "obsidian";
import { SettingsType } from "../../SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { ProcessorTypes } from "../../../Components/Processor/ProcessorUtils";

export default class ProcessorBuilder extends AbstractBuilder<SettingsType, "processor"> {
    private setting: Setting;
    support(k: keyof SettingsType): boolean {
        return k === "processor";
    }

    doBuild(): void {
        this.setting = new Setting(this.container).setName("Processor").setDesc("Modifies resolved title, if enabled");

        this.buildDynamic();
    }

    private buildDynamic(): void {
        this.setting.addDropdown(c =>
            c
                .addOptions({
                    [ProcessorTypes.None]: "None",
                    [ProcessorTypes.Replace]: "Replace",
                    [ProcessorTypes.Function]: "Function",
                })
                .setValue(this.item.get("type").value())
                .onChange((v: ProcessorTypes) => {
                    this.item.get("type").set(v);
                    this.setting.controlEl.innerHTML = "";
                    this.buildDynamic();
                })
        );

        switch (this.item.get("type").value()) {
            case ProcessorTypes.Function:
                return this.buildFunction();
            case ProcessorTypes.Replace:
                return this.buildReplace();
        }
    }

    private buildReplace(): void {
        const items = [
            { name: "Pattern", desc: "Description of pattern" },
            { name: "Replacement", desc: "Description of replacement" },
        ];
        for (const item of items) {
            const container = createDiv();
            container.appendChild(
                createDiv({}, e => {
                    e.appendChild(createDiv({ cls: "setting-item-name" }, e => e.appendText(item.name)));
                    new TextComponent(e);
                })
            );
            container.appendChild(createDiv({ cls: "setting-item-description" }, e => e.appendText(item.desc)));
            this.setting.controlEl.appendChild(container);
        }
    }

    private buildFunction(): void {
        this.setting.addTextArea(e => {});
    }
}
