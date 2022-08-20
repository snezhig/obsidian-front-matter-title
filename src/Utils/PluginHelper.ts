import {SettingsType} from "@src/Settings/SettingsType";

export default class PluginHelper {
    public static createDefaultSettings(): SettingsType {
        return {
            templates: [],
            managers: {
                explorer: false,
                graph: false,
                header: false,
                quick_switcher: false
            },
            rules: {
                paths: {
                    mode: 'black',
                    values: []
                },
                delimiter: {
                    enabled: false,
                    value: ''
                }
            },
            debug: false,
            boot: {
                delay: 0
            }
        }
    }
}