import { Feature } from "@src/Enum";
import { injectable } from "inversify";
import { t } from "../i18n/Locale";

@injectable()
export default class FeatureHelper {
    getOrderedFeatures(): Feature[] {
        return [
            Feature.Alias,
            Feature.Explorer,
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
                return t("feature.alias.name");
            case Feature.Explorer:
                return t("feature.explorer.name");
            case Feature.Graph:
                return t("feature.graph.name");
            case Feature.Header:
                return t("feature.header.name");
            case Feature.Starred:
                return t("feature.starred.name");
            case Feature.Search:
                return t("feature.search.name");
            case Feature.Suggest:
                return t("feature.suggest.name");
            case Feature.Tab:
                return t("feature.tab.name");
            case Feature.InlineTitle:
                return t("feature.inlineTitle.name");
            case Feature.Canvas:
                return t("feature.canvas.name");
            case Feature.Backlink:
                return t("feature.backlink.name");
            case Feature.NoteLink:
                return t("feature.noteLink.name");
        }
    }

    getDescription(feature: Feature): string {
        switch (feature) {
            case Feature.Alias:
                return t("feature.alias.desc");
            case Feature.Explorer:
                return t("feature.explorer.desc");
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
