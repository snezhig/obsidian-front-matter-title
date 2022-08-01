export type SettingsManagersType = 'graph' | 'explorer' | 'header' | 'quick_switcher'
export type SettingsType = {
    path: string,
    managers: { [k in SettingsManagersType]: boolean }
};

export type SettingsEvent = {
    'settings.changed': SettingsType
}