import { Setting, TextComponent } from "obsidian";
import { SettingsType } from "../../SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import { ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import { GITHUB_DOCS } from "@src/Enum";
import { t } from "../../../i18n/Locale";

export default class ProcessorBuilder extends AbstractBuilder<SettingsType, "processor"> {
    private setting: Setting;
    private lastArgs: { [K in ProcessorTypes]?: string[] } = {};

    support(k: keyof SettingsType): boolean {
        return k === "processor";
    }

    doBuild(): void {
        const fragment = createFragment(e =>
            e.createEl("a", {
                text: t("processor.name"),
                href: GITHUB_DOCS + "Processor.md",
            })
        );
        this.setting = new Setting(this.container).setName(fragment);
        this.buildDynamic();
    }

    private updateDesc(): void {
        const fragment = createFragment();
        fragment.appendText(t("processor.desc"));
        let additional: (string | HTMLElement)[] = [];
        switch (this.item.get("type").value()) {
            case ProcessorTypes.Replace:
                additional = [
                    "",
                    t("processor.replace.desc"),
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
                    t("processor.function.desc"),
                    `const value = new Function('title', #${t("processor.function.valueDesc")}#)`,
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
                    "": t("disabled"),
                    [ProcessorTypes.Replace]: t("processor.replace.name"),
                    [ProcessorTypes.Function]: t("processor.function.name"),
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
                name: t("processor.replace.pattern.name"),
                desc: t("processor.replace.pattern.desc"),
            },
            { name: t("processor.replace.flags.name"), desc: t("processor.replace.flags.desc") },
            { name: t("processor.replace.replacement.name"), desc: t("processor.replace.replacement.desc") },
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
