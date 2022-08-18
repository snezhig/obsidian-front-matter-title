export type SettingsManagersType = 'graph' | 'explorer' | 'header' | 'quick_switcher'
export type SettingsType = {
    template: string,
    template_fallback: string,
    rules: {
        paths: { mode: 'black' | 'white', values: string[] },
        delimiter: {enabled: boolean, value: string},
    },
    managers: { [k in SettingsManagersType]: boolean },
    debug: boolean
};

export type SettingsEvent = {
    'settings.changed': { old: SettingsType, actual: SettingsType },
    'settings.loaded': { settings: SettingsType }
}