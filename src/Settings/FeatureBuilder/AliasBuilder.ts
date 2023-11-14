import { Feature } from "@src/Enum";
import { DropdownComponent, Setting } from "obsidian";
import AbstractBuilder from "./AbstractBuilder";
import { StrategyType, ValidatorType } from "@src/Feature/Alias/Types";
import { t } from "@src/i18n/Locale";

export default class AliasBuilder extends AbstractBuilder<Feature.Alias> {
    private validatorDropdown: DropdownComponent;
    private strategyDropdown: DropdownComponent;
    private extraSettingContainerEl: HTMLElement;

    doBuild(): void {
        this.buildEnable();
        this.extraSettingContainerEl = this.context.getContainer().createDiv();
        this.buildValidatorDropdown(this.options.settings.validator);
        this.buildStrategyDropdown(this.options.settings.strategy);
    }

    protected getExtraSettingContainer(): HTMLElement | null {
        return this.extraSettingContainerEl;
    }

    private buildValidatorDropdown(value: string): void {
        const s = new Setting(this.extraSettingContainerEl).setName(t("strategy"));
        this.validatorDropdown = new DropdownComponent(s.controlEl)
            .addOptions({
                [ValidatorType.FrontmatterAuto]: t("feature.alias.validator.auto.name"),
                [ValidatorType.FrontmatterRequired]: t("feature.alias.validator.required.name"),
            })
            .setValue(value ? value : ValidatorType.FrontmatterRequired)
            .onChange(v => {
                this.actualizeValidatorDesc(s, v);
                this.options.settings.validator = v;
                this.dispatchChanges();
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
        const s = new Setting(this.extraSettingContainerEl).setName(t("strategy"));
        this.strategyDropdown = new DropdownComponent(s.controlEl)
            .addOptions({
                [StrategyType.Ensure]: t("feature.alias.strategy.ensure.name"),
                [StrategyType.Adjust]: t("feature.alias.strategy.adjust.name"),
                [StrategyType.Replace]: t("feature.alias.strategy.replace.name"),
            })
            .setValue(value ? value : StrategyType.Ensure)
            .onChange(v => {
                this.actualizeStrategyDesc(s, v);
                this.options.settings.strategy = v;
                this.dispatchChanges();
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
}
