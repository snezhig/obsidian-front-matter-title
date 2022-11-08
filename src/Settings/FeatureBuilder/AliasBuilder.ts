import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { Feature } from "@src/enum";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import AbstractBuilder from "./AbstractBuilder";

export default class AliasBuilder extends AbstractBuilder<Feature.Alias> {
    private setting: Setting;
    private toggle: ToggleComponent;
    private dropdown: DropdownComponent;
    private id: Feature;
    private desc: string;

    build({ id, name, desc, settings }: BuildParams<Feature.Alias>): void {
        this.id = id;
        this.desc = desc;
        this.setting = new Setting(this.context.containerEl).setName(name).setDesc(desc);
        this.buildDropdown(settings.strategy);
        this.buildToggle(settings.enabled);
        this.actualizeDesc();
    }

    private buildDropdown(value: string): void {
        this.setting.addDropdown(
            c =>
                (this.dropdown = c
                    .addOptions({
                        ensure: "Ensure",
                        adjust: "Adjust",
                        replace: "Replace",
                    })
                    .setValue(value ? value : "ensure")
                    .onChange(this.onChange.bind(this)))
        );
    }

    private buildToggle(value: boolean): void {
        this.setting.addToggle(e => (this.toggle = e.setValue(value).onChange(this.onChange.bind(this))));
    }

    private onChange(): void {
        this.context.getDispatcher().dispatch(
            "settings:tab:feature:changed",
            new Event({
                id: this.id,
                value: { enabled: this.toggle.getValue(), strategy: this.dropdown.getValue() },
            })
        );
        this.actualizeDesc();
    }

    private actualizeDesc(): void {
        let strategyDesc = "";
        switch (this.dropdown.getValue()) {
            case "ensure":
                strategyDesc = "Set title as an alias only if the one does not exist";
                break;
            case "replace":
                strategyDesc = "Replace current alias with title";
                break;
            case "adjust":
                strategyDesc = "Add title to alias and without affect on existing alias";
                break;
        }
        const fragment = createFragment();
        fragment.appendText(this.desc);
        fragment.createEl("br");
        fragment.appendText(`Strategy: ${strategyDesc}`);
        this.setting.setDesc(fragment);
    }
}
