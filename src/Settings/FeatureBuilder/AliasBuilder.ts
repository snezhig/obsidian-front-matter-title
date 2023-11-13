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

    doBuild(): void {
        const { id, name, desc, settings } = this.options;
        this.id = id;
        this.desc = desc;
        this.context.getContainer().createEl("h5", { text: name });
        this.setting = new Setting(this.context.getContainer()).setName(desc);
        this.buildValidatorDropdown(settings.validator);
        this.buildStrategyDropdown(settings.strategy);
        this.buildToggle(settings.enabled);
    }

    private buildValidatorDropdown(value: string): void {
        const s = new Setting(this.context.getContainer()).setName(t("strategy"));
        this.validatorDropdown = new DropdownComponent(s.controlEl)
            .addOptions({
                [ValidatorType.FrontmatterAuto]: t("feature.alias.validator.auto.name"),
                [ValidatorType.FrontmatterRequired]: t("feature.alias.validator.required.name"),
            })
            .setValue(value ? value : ValidatorType.FrontmatterRequired)
            .onChange(v => {
                this.actualizeValidatorDesc(s, v);
                this.onChange();
            });
        this.actualizeValidatorDesc(s, this.validatorDropdown.getValue());
    }

    private actualizeValidatorDesc(setting: Setting, value: string): string {
        let text = "";
        switch (value) {
            case ValidatorType.FrontmatterAuto: {
                text = t("feature.alias.validator.auto.desc");
                break;
            }
            case ValidatorType.FrontmatterRequired: {
                text = t("feature.alias.validator.required.desc");
                break;
            }
        }
        setting.setDesc(text);
    }

    private buildStrategyDropdown(value: string): void {
        const s = new Setting(this.context.getContainer()).setName(t("strategy"));
        this.strategyDropdown = new DropdownComponent(s.controlEl)
            .addOptions({
                [StrategyType.Ensure]: t("feature.alias.strategy.ensure.name"),
                [StrategyType.Adjust]: t("feature.alias.strategy.adjust.name"),
                [StrategyType.Replace]: t("feature.alias.strategy.replace.name"),
            })
            .setValue(value ? value : StrategyType.Ensure)
            .onChange(v => {
                this.onChange();
                this.actualizeStrategyDesc(s, v);
            });
        this.actualizeStrategyDesc(s, this.strategyDropdown.getValue());
    }
    private actualizeStrategyDesc(setting: Setting, value: string): string {
        let desc = "";
        switch (value) {
            case StrategyType.Ensure:
                desc = t("feature.alias.strategy.ensure.desc");
                break;
            case StrategyType.Replace:
                desc = t("feature.alias.strategy.replace.desc");
                break;
            case StrategyType.Adjust:
                desc = t("feature.alias.strategy.adjust.desc");
                break;
        }
        setting.setDesc(desc);
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
    }
}
