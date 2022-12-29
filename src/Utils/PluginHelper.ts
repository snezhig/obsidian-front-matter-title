import { SettingsType } from "@src/Settings/SettingsType";
import { Feature } from "@src/enum";
import { ProcessorTypes } from "../Components/Processor/ProcessorUtils";

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
            features: {
                [Feature.Alias]: { enabled: false, strategy: "" },
                [Feature.Explorer]: { enabled: false },
                [Feature.ExplorerSort]: { enabled: false },
                [Feature.Tab]: { enabled: false },
                [Feature.Header]: { enabled: false },
                [Feature.Graph]: { enabled: false },
                [Feature.Starred]: { enabled: false },
                [Feature.Search]: { enabled: false },
                [Feature.Suggest]: { enabled: false },
            },
            processor: {
                args: [],
                type: null,
            },
        };
    }
}
