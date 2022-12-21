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
                    this.item.get("args").set([]);
                    this.setting.controlEl.innerHTML = "";
                    this.buildDynamic();
                })
        );
        this.setAlignItemsMode("center");

        switch (this.item.get("type").value()) {
            case ProcessorTypes.Function:
                return this.buildFunction();
            case ProcessorTypes.Replace:
                this.setAlignItemsMode("start");
                return this.buildReplace();
        }
    }

    private setAlignItemsMode(mode: "center" | "start"): void {
        this.setting.settingEl.style.alignItems = mode;
        this.setting.controlEl.style.alignItems = mode;
    }

    private buildReplace(): void {
        const items = [
            {
                name: "Pattern",
                desc: "Will be used as an argument of RegExp first, and then as a first argument of replace()",
            },
            { name: "Replacement", desc: "Will be used as a second argument of replace()" },
        ];
        const container = createDiv({ attr: { style: "margin-left: 20px" } });
        let margin = "10px";
        const value = this.item.get("args").value();
        for (const [i, item] of items.entries()) {
            const c = createDiv({
                attr: { style: `margin-bottom: ${margin}` },
            });
            margin = "0px";
            c.appendChild(
                createDiv(
                    {
                        attr: { style: "display: flex; align-items: center; justify-content: space-between;" },
                    },
                    e => {
                        e.appendChild(
                            createDiv({ attr: { style: "margin-right: 10px" } }, e => e.appendText(`${item.name}:`))
                        );
                        new TextComponent(e).setValue(value?.[i] ?? null).onChange(e => value.splice(i, 1, e));
                    }
                )
            );
            c.appendChild(
                createDiv({ cls: "setting-item-description", attr: { style: "text-align: left" } }, e =>
                    e.appendText(item.desc)
                )
            );
            container.appendChild(c);
        }
        this.setting.controlEl.appendChild(container);
    }

    private buildFunction(): void {
        this.setting.addTextArea(e =>
            e.setValue(this.item.get("args").value().join()).onChange(e => this.item.get("args").set([e]))
        );
    }
}
