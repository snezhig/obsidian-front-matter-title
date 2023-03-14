import { Feature } from "@src/Enum";
import { injectable } from "inversify";

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
                return "Modify alias in metadata cache. The real alias will not be affected";
            case Feature.Explorer:
                return "Replace shown titles in the file explorer";
            case Feature.ExplorerSort:
                return "Sort files in explorer by titles from Explorer feature";
            case Feature.Graph:
                return "Replace shown titles in the graph/local-graph";
            case Feature.Header:
                return "Replace titles in header of leaves and update them";
            case Feature.Starred:
                return "Replace shown titles in built-in starred plugin";
            case Feature.Search:
                return "Replace shown titles in search leaf";
            case Feature.Suggest:
                return "Replace shown titles in suggest modals";
            case Feature.Tab:
                return "Replace shown titles in tabs";
            case Feature.InlineTitle:
                return "Replace shown titles in Inline Title";
            case Feature.Canvas:
                return "Replace shown titles in Canvas";
            case Feature.Backlink:
                return "Replace shown titles in Backlink(Linked mentions)";
        }
    }
}
