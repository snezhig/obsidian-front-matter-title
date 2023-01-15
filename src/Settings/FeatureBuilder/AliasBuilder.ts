import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { Feature } from "@src/enum";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import AbstractBuilder from "./AbstractBuilder";
import { StrategyType, ValidatorType } from "../../Feature/Alias/Types";

export default class AliasBuilder extends AbstractBuilder<Feature.Alias> {
    private setting: Setting;
    private toggle: ToggleComponent;
    private validatorDropdown: DropdownComponent;
    private strategyDropdown: DropdownComponent;
    private id: Feature;
    private desc: string;

    build({ id, name, desc, settings }: BuildParams<Feature.Alias>): void {
        this.id = id;
        this.desc = desc;
        this.setting = new Setting(this.context.getContainer()).setName(name).setDesc(desc);
        this.buildValidatorDropdown(settings.validator);
        this.buildStrategyDropdown(settings.strategy);
        this.buildToggle(settings.enabled);
        this.actualizeDesc();
    }

    private buildValidatorDropdown(value: string): void {
        this.validatorDropdown = new DropdownComponent(this.setting.controlEl)
            .addOptions({
                [ValidatorType.FrontmatterAuto]: "Frontmatter Auto",
                [ValidatorType.FrontmatterRequired]: "Frontmatter Required",
            })
            .setValue(value ? value : ValidatorType.FrontmatterRequired)
            .onChange(this.onChange.bind(this));
    }

    private buildStrategyDropdown(value: string): void {
        this.strategyDropdown = new DropdownComponent(this.setting.controlEl)
            .addOptions({
                [StrategyType.Ensure]: "Ensure",
                [StrategyType.Adjust]: "Adjust",
                [StrategyType.Replace]: "Replace",
            })
            .setValue(value ? value : StrategyType.Ensure)
            .onChange(this.onChange.bind(this));
    }

    private buildToggle(value: boolean): void {
        this.setting.addToggle(e => (this.toggle = e.setValue(value).onChange(this.onChange.bind(this))));
    }

    private onChange(): void {
        this.context.getDispatcher().dispatch(
            "settings:tab:feature:changed",
            new Event({
                id: this.id,
                value: {
                    enabled: this.toggle.getValue(),
                    strategy: this.strategyDropdown.getValue(),
                    validator: this.validatorDropdown.getValue(),
                },
            })
        );
        this.actualizeDesc();
    }

    private getStrategyFragment(): DocumentFragment {
        let text = "";
        switch (this.strategyDropdown.getValue()) {
            case StrategyType.Ensure:
                text = "Set title as an alias only if the one does not exist";
                break;
            case StrategyType.Replace:
                text = "Replace current alias with title";
                break;
            case StrategyType.Adjust:
                text = "Add title to alias and without affect on existing alias";
                break;
        }
        const fragment = createFragment();
        fragment.createEl("b", "", e => e.setText("Strategy: "));
        fragment.appendText(text);
        return fragment;
    }

    private getValidatorFragment(): DocumentFragment {
        let text = "";
        switch (this.validatorDropdown.getValue()) {
            case ValidatorType.FrontmatterAuto: {
                text = "If frontmatter does not exist, it will be created in cache. Side-effects may occur.";
                break;
            }
            case ValidatorType.FrontmatterRequired: {
                text = "Only files with frontmatter will be processed.";
                break;
            }
        }
        const fragment = createFragment();
        fragment.createEl("b", "", e => e.setText("Validator: "));
        fragment.appendText(text);
        return fragment;
    }

    private actualizeDesc(): void {
        const fragment = createFragment();
        fragment.appendText(this.desc);
        fragment.createEl("br");
        fragment.append(this.getValidatorFragment());
        fragment.createEl("br");
        fragment.append(this.getStrategyFragment());

        this.setting.setDesc(fragment);
    }
}
