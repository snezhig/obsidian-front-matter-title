import {Feature, Manager} from "@src/enum";

export type SettingsManagersType = Manager;
export type SettingsFeatures<F extends Feature> = { [K in F]: { enabled: boolean } };
export type SettingsType = {
    templates: string[],
    rules: {
        paths: { mode: 'black' | 'white', values: string[] },
        delimiter: { enabled: boolean, value: string },
        file_note_link: {
            replace_all: boolean
        }
    },
    managers: { [k in SettingsManagersType]: boolean },
    debug: boolean,
    boot: {
        delay: number
    },
    features: SettingsFeatures<Feature>
};

export type SettingsEvent = {
    'settings.changed': { old: SettingsType, actual: SettingsType },
    'settings.loaded': { settings: SettingsType },
    'settings:tab:manager:changed': { id: Manager, value: boolean }
}
