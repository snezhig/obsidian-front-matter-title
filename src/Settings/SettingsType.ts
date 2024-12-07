import { ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import { Feature } from "@src/Enum";
import { Changed } from "@src/Utils/ObjectHelper";
import { StrategyType as AliasStrategyType, ValidatorType as AliasValidatorType } from "../Feature/Alias/Types";
import { NoteLinkStrategy } from "@src/Feature/NoteLink/NoteLinkTypes";

type SettingsFeatureSpecific = {
    [Feature.Alias]: { strategy: AliasStrategyType; validator: AliasValidatorType };
    [Feature.NoteLink]: { approval: boolean; strategy: NoteLinkStrategy };
    [Feature.Explorer]: { sort: boolean };
};
export type SettingsFeatureCommon = { enabled: boolean; templates: TemplateValue };
export type SettingsFeature = {
    [K in Feature]: K extends keyof SettingsFeatureSpecific
        ? SettingsFeatureSpecific[K] & SettingsFeatureCommon
        : SettingsFeatureCommon;
};

export type TemplateValue = { main: string | null; fallback: string | null };
export type TemplateNames = "common";
export type SettingsType = {
    version: string;
    templates: { common: TemplateValue };

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
        background: boolean;
    };
    features: SettingsFeature;
};

export type SettingsEvent = {
    "settings:changed": { old: SettingsType; actual: SettingsType; changed: Changed<SettingsType> };
    "settings:tab:close": null;
    "settings.loaded": { settings: SettingsType };
    "settings:tab:feature:changed": { id: Feature; value: SettingsFeature[keyof SettingsFeature] };
};

// enum Feature {
//     Foo,
//     Bar,
//     Quo,
// }
// type SettingSpecific = {
//     [Feature.Foo]: { strategy: string };
//     [Feature.Quo]: { vaidator: string };
//     //Feature.Bar does not have specific config
// };
// type SettingsFeatureCommon = { enabled: boolean; templates: TemplateValue };
//
// type Setting = {
//     [K in Feature]: K extends keyof SettingSpecific ? SettingSpecific & SettingsFeatureCommon : SettingsFeatureCommon;
// };
//
// export type BuildSettingConfig<K> = K extends keyof SettingSpecific ? SettingSpecific[K] : SettingsFeatureCommon;
// export type BuildParams<K extends keyof Feature> = {
//     id: K;
//     name: string;
//     desc: string;
//     config: BuildSettingConfig<K>;
//     doc: { link: string };
// };
