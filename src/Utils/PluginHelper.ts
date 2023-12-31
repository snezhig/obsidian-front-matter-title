import { SettingsType } from "@src/Settings/SettingsType";
import { Feature } from "@src/Enum";
import { StrategyType, ValidatorType } from "../Feature/Alias/Types";
import { NoteLinkStrategy } from "@src/Feature/NoteLink/NoteLinkTypes";

declare const PLUGIN_VERSION: string;

export type CompareOperation = ">" | ">=" | "=" | "!=" | "<" | "<=";
export default class PluginHelper {
    public static compareVersion(version1: string, comparator: CompareOperation, version2: string): boolean {
        const left = version1.split(".").map(Number);
        const right = version2.split(".").map(Number);

        for (let i = 0; i < 3; ++i) {
            if (left[i] > right[i]) {
                return comparator === ">" || comparator === ">=" || comparator === "!=";
            } else if (left[i] < right[i]) {
                return comparator === "<" || comparator === "<=" || comparator === "!=";
            }
        }
        return comparator === "=" || comparator === ">=" || comparator === "<=";
    }

    public static createDefaultSettings(): SettingsType {
        return {
            version: PLUGIN_VERSION,
            templates: {
                common: { main: "title", fallback: "fallback_title" },
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
                [Feature.Explorer]: { enabled: false, sort: false, templates: { main: "", fallback: "" } },
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
