import { Setting, TextComponent } from "obsidian";
import { SettingsType } from "../../SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { ProcessorTypes } from "../../../Components/Processor/ProcessorUtils";

export default class ProcessorBuilder extends AbstractBuilder<SettingsType, "processor"> {
    private setting: Setting;
    private lastArgs: { [K in ProcessorTypes]?: string[] } = {};
    support(k: keyof SettingsType): boolean {
        return k === "processor";
    }

    doBuild(): void {
        this.setting = new Setting(this.container).setName("Processor");
        this.buildDynamic();
    }

    private updateDesc(): void {
        const fragment = createFragment();
        fragment.appendText("Modifies resolved title.");
        let additional: (string | HTMLElement)[] = [];
        switch (this.item.get("type").value()) {
            case ProcessorTypes.Replace:
                additional = [
                    "",
                    "What will be executed:",
                    "title.replace(",
                    createSpan(
                        "",
                        e =>
                            (e.innerHTML =
                                "&emsp;new RegExp(<br>&emsp;&emsp;#pattern#, <br>&emsp;&emsp;#flags#<br>&emsp;),")
                    ),
                    createSpan("", e => (e.innerHTML = "&emsp;#replacement#")),
                    ")",
                ];

                break;
            case ProcessorTypes.Function:
                additional = [
                    "",
                    "How it will work:",
                    "const value = new Function('title', #Your value of text area#)",
                ];
                break;
        }
        additional.forEach(e => {
            fragment.appendChild(createEl("br"));
            typeof e === "string" ? fragment.appendText(e) : fragment.appendChild(e);
        });
        this.setting.setDesc(fragment);
    }

    private buildDynamic(): void {
        this.updateDesc();
        this.setting.addDropdown(c =>
            c
                .addOptions({
                    "": "Disabled",
                    [ProcessorTypes.Replace]: "Replace",
                    [ProcessorTypes.Function]: "Function",
                })
                .setValue(this.item.get("type").value() ?? "")
                .onChange((v: ProcessorTypes | "") => {
                    const value: ProcessorTypes | null = v === "" ? null : v;
                    const type = this.item.get("type").value();
                    this.lastArgs[type] = [...this.item.get("args").value()];
                    this.item.get("type").set(value);
                    this.item.get("args").set([...(this.lastArgs?.[value] ?? [])]);
                    this.setting.controlEl.innerHTML = "";
                    this.buildDynamic();
                })
        );
        this.setAlignItemsMode("center");

        switch (this.item.get("type").value()) {
            case ProcessorTypes.Function:
                this.setAlignItemsMode("start");
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
                desc: "Will be used as a first argument of RegExp first, and then as a first argument of replace()",
            },
            { name: "Flags", desc: "Will be used as a second argument of new RegExp" },
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
                        new TextComponent(e)
                            .setValue(value?.[i] ?? "")
                            .onChange(e => value.splice(i, 1, e))
                            .onChanged();
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
        this.setting.controlEl.prepend(container);
    }

    private buildFunction(): void {
        this.setting.addTextArea(e =>
            e.setValue(this.item.get("args").value().join()).onChange(e => this.item.get("args").set([e]))
        );
    }
}
