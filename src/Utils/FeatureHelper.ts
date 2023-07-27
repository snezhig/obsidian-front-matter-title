import { Feature } from "@src/Enum";
import { injectable } from "inversify";
import { t } from "../i18n/Locale";

@injectable()
export default class FeatureHelper {
    getOrderedFeatures(): Feature[] {
        return [
            Feature.Alias,
            Feature.Explorer,
            Feature.ExplorerSort,
            Feature.Graph,
            Feature.Header,
            Feature.Starred,
            Feature.Search,
            Feature.Suggest,
            Feature.Tab,
            Feature.InlineTitle,
            Feature.Canvas,
            Feature.Backlink,
            Feature.NoteLink,
        ];
    }

    getName(feature: Feature): string {
        switch (feature) {
            case Feature.Alias:
                return "Alias";
            case Feature.Explorer:
                return "Explorer";
            case Feature.ExplorerSort:
                return "Explorer Sort";
            case Feature.Graph:
                return "Graph";
            case Feature.Header:
                return "Header";
            case Feature.Starred:
                return "Starred";
            case Feature.Search:
                return "Search";
            case Feature.Suggest:
                return "Suggest";
            case Feature.Tab:
                return "Tabs";
            case Feature.InlineTitle:
                return "Inline";
            case Feature.Canvas:
                return "Canvas";
            case Feature.Backlink:
                return "Backlink";
            case Feature.NoteLink:
                return "Note Link";
        }
    }

    getDescription(feature: Feature): string {
        switch (feature) {
            case Feature.Alias:
                return t("feature.alias.desc");
            case Feature.Explorer:
                return t("feature.explorer.desc");
            case Feature.ExplorerSort:
                return t("feature.explorer:sort.desc");
            case Feature.Graph:
                return t("feature.graph.desc");
            case Feature.Header:
                return t("feature.header.desc");
            case Feature.Starred:
                return t("feature.starred.desc");
            case Feature.Search:
                return t("feature.search.desc");
            case Feature.Suggest:
                return t("feature.suggest.desc");
            case Feature.Tab:
                return t("feature.tab.desc");
            case Feature.InlineTitle:
                return t("feature.inlineTitle.desc");
            case Feature.Canvas:
                return t("feature.canvas.desc");
            case Feature.Backlink:
                return t("feature.backlink.desc");
            case Feature.NoteLink:
                return t("feature.noteLink.desc");
        }
    }

    getDocSection(feature: Feature): string {
        switch (feature) {
            case Feature.NoteLink:
                return "Features/NoteLink.md";
            default:
                return feature;
        }
    }
}
