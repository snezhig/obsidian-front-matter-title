export type SettingsManagersType = 'graph' | 'explorer' | 'header' | 'quick_switcher'
export type SettingsType = {
    template: string,
    rules: {
        paths: { mode: 'black' | 'white', values: string[] }
    },
    managers: { [k in SettingsManagersType]: boolean }
};

export type SettingsEvent = {
    'settings.changed': { old: SettingsType, actual: SettingsType },
    'settings.loaded': { settings: SettingsType }
}