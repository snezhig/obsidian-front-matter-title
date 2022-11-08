import { SettingsType } from "@src/Settings/SettingsType";
import { DeprecatedFeature, Feature } from "@src/enum";

export default class PluginHelper {
    public static createDefaultSettings(): SettingsType {
        return {
            templates: [],
            rules: {
                paths: {
                    mode: "black",
                    values: [],
                },
                delimiter: {
                    enabled: false,
                    value: "",
                },
            },
            debug: false,
            boot: {
                delay: 0,
            },
            deprecated_features: {
                [DeprecatedFeature.ExplorerSort]: { enabled: false },
            },
            features: {
                [Feature.Alias]: { enabled: false, strategy: "" },
                [Feature.Explorer]: { enabled: false },
                [Feature.ExplorerSort]: { enabled: false },
                [Feature.Tab]: { enabled: false },
                [Feature.Header]: { enabled: false },
                [Feature.Graph]: { enabled: false },
                [Feature.QuickSwitcher]: { enabled: false },
                [Feature.Starred]: { enabled: false },
                [Feature.Search]: { enabled: false },
            },
        };
    }
}
