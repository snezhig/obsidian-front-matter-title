import { FeatureInfoInterface } from "@src/Utils/FeatureInfo/Interfaces";
import { Feature } from "@src/enum";

export default class FeatureInfo implements FeatureInfoInterface {
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
        }
    }
}
