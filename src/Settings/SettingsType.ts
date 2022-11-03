import {DeprecatedFeature, Feature } from "@src/enum";

export type SettingsFeatures<F extends DeprecatedFeature> = { [K in F]: { enabled: boolean } };
export type SFExt = {
    [Feature.Alias]: { strategy: string },
}
export type SFC = { enabled: boolean };
export type SF = { [K in Feature]: SFC & { [P in keyof SFExt]: P extends K ? SFExt[P] : object }[keyof SFExt] }


export type SettingsType = {
    templates: string[];
    rules: {
        paths: { mode: "black" | "white"; values: string[] };
        delimiter: { enabled: boolean; value: string };
    };
    debug: boolean;
    boot: {
        delay: number;
    };
    deprecated_features: SettingsFeatures<DeprecatedFeature>;
    features: SF
};

export type SettingsEvent = {
    "settings.changed": { old: SettingsType; actual: SettingsType };
    "settings.loaded": { settings: SettingsType };
    "settings:tab:manager:changed": { id: Feature; value: boolean };
    "settings:tab:feature:changed": { id: Feature; value: SF[keyof SF] }
};

