import { ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import { Feature } from "@src/Enum";
import { Changed } from "@src/Utils/ObjectHelper";
import { StrategyType as AliasStrategyType, ValidatorType as AliasValidatorType } from "../Feature/Alias/Types";

export type SFExt = {
    [Feature.Alias]: { strategy: AliasStrategyType; validator: AliasValidatorType };
};
export type SFC = { enabled: boolean };
export type SF = { [K in Feature]: SFC & { [P in keyof SFExt]: P extends K ? SFExt[P] : object }[keyof SFExt] };

export type TemplateValue = { main: string | null; fallback: string | null };
export type TemplateNames = "common" & Feature;
export type SettingsType = {
    templates: { [K in Feature]?: TemplateValue } & { common: TemplateValue };

    processor: {
        type: ProcessorTypes | null;
        args: string[];
    };
    rules: {
        paths: { mode: "black" | "white"; values: string[] };
        delimiter: { enabled: boolean; value: string };
    };
    debug: boolean;
    boot: {
        delay: number;
    };
    features: SF;
};

export type SettingsEvent = {
    "settings:changed": { old: SettingsType; actual: SettingsType; changed: Changed<SettingsType> };
    "settings:tab:close": null;
    "settings.loaded": { settings: SettingsType };
    "settings:tab:manager:changed": { id: Feature; value: boolean };
    "settings:tab:feature:changed": { id: Feature; value: SF[keyof SF] };
};
