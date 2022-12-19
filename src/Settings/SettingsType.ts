import { ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import { Feature } from "@src/enum";
import { Changed } from "@src/Utils/ObjectHelper";

export type SFExt = {
    [Feature.Alias]: { strategy: string };
};
export type SFC = { enabled: boolean };
export type SF = { [K in Feature]: SFC & { [P in keyof SFExt]: P extends K ? SFExt[P] : object }[keyof SFExt] };

export type SettingsTypeRulesDelimiter = { enabled: boolean; value: string };
export type SettingsTypeRules = {
    paths: { mode: "black" | "white"; values: string[] };
    delimiter: SettingsTypeRulesDelimiter;
};
export type SettingsType = {
    templates: string[];
    processor: {
        type: ProcessorTypes | null;
        args: string[];
    };
    rules: {
        paths: { mode: "black" | "white"; values: string[] };
        delimiter: SettingsTypeRulesDelimiter;
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
