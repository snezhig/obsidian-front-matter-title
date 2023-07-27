import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { Feature } from "@src/Enum";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import AbstractBuilder from "./AbstractBuilder";
import { StrategyType, ValidatorType } from "../../Feature/Alias/Types";
import { t } from "../../i18n/Locale";

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
                [ValidatorType.FrontmatterAuto]: t("feature.alias.validator.auto.name"),
                [ValidatorType.FrontmatterRequired]: t("feature.alias.validator.required.name"),
            })
            .setValue(value ? value : ValidatorType.FrontmatterRequired)
            .onChange(this.onChange.bind(this));
    }

    private buildStrategyDropdown(value: string): void {
        this.strategyDropdown = new DropdownComponent(this.setting.controlEl)
            .addOptions({
                [StrategyType.Ensure]: t("feature.alias.strategy.ensure.name"),
                [StrategyType.Adjust]: t("feature.alias.strategy.adjust.name"),
                [StrategyType.Replace]: t("feature.alias.strategy.replace.name"),
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
                text = t("feature.alias.strategy.ensure.desc");
                break;
            case StrategyType.Replace:
                text = t("feature.alias.strategy.replace.desc");
                break;
            case StrategyType.Adjust:
                text = t("feature.alias.strategy.adjust.desc");
                break;
        }
        const fragment = createFragment();
        fragment.createEl("b", "", e => e.setText(`${t("strategy")}: `));
        fragment.appendText(text);
        return fragment;
    }

    private getValidatorFragment(): DocumentFragment {
        let text = "";
        switch (this.validatorDropdown.getValue()) {
            case ValidatorType.FrontmatterAuto: {
                text = t("feature.alias.validator.auto.desc");
                break;
            }
            case ValidatorType.FrontmatterRequired: {
                text = t("feature.alias.validator.required.desc");
                break;
            }
        }
        const fragment = createFragment();
        fragment.createEl("b", "", e => e.setText(`${t("validator")}: `));
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
