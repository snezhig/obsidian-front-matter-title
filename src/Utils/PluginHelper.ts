import { SettingsType } from "@src/Settings/SettingsType";
import { Feature } from "@src/Enum";
import { StrategyType, ValidatorType } from "../Feature/Alias/Types";
import { NoteLinkStrategy } from "@src/Feature/NoteLink/NoteLinkTypes";

declare const PLUGIN_VERSION: string;

export type CompareOperation = ">" | ">=" | "=" | "!=" | "<" | "<=";
export default class PluginHelper {
    public static compareVersion(left: string, operation: CompareOperation, right: string): boolean {
        const leftV = left.split(".").map(e => parseInt(e));
        const rightV = right.split(".").map(e => parseInt(e));
        let result = true;
        for (const [k, i] of leftV.entries()) {
            if (operation.includes(">")) {
                if (i !== rightV[k]) {
                    result = i > rightV[k];
                    break;
                }
            } else if (operation.includes("<")) {
                if (i !== rightV[k]) {
                    result = i < rightV[k];
                    break;
                }
            } else if (operation.includes("=")) {
                if (i !== rightV[k]) {
                    result = false;
                    break;
                }
            }
        }
        return operation.includes("!") ? !result : result;
    }

    public static createDefaultSettings(): SettingsType {
        return {
            version: PLUGIN_VERSION,
            templates: {
                common: { main: "title", fallback: "fallback_title" },
                ...Object.fromEntries(Object.values(Feature).map(e => [e, { main: null, fallback: null }])),
            },
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
                delay: 1000,
            },
            features: {
                [Feature.Alias]: {
                    enabled: false,
                    strategy: StrategyType.Ensure,
                    validator: ValidatorType.FrontmatterRequired,
                    templates: { main: "", fallback: "" },
                },
                [Feature.Explorer]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.ExplorerSort]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Tab]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Header]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Graph]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Starred]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Search]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Suggest]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.InlineTitle]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Canvas]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.Backlink]: { enabled: false, templates: { main: "", fallback: "" } },
                [Feature.NoteLink]: {
                    enabled: false,
                    strategy: NoteLinkStrategy.OnlyEmpty,
                    approval: true,
                    templates: { main: "", fallback: "" },
                },
            },
            processor: {
                args: [],
                type: null,
            },
        };
    }
}
