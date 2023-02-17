import "obsidian";
import { Events, MarkdownView, MetadataCache, Plugin, TFile, TFolder, View, WorkspaceLeaf } from "obsidian";

declare module "obsidian" {
    export interface TFileExplorerItem {
        file: TFile | TFolder;
        titleEl: HTMLDivElement;
        titleInnerEl: HTMLDivElement;
        sort?: () => void;
        vChildren?: {
            setChildren(items: any[]): void;
        };
    }

    export abstract class StarredPluginView extends ViewPluginEventable {
        itemLookup: WeakMap<Element, { type: string | "file"; title: string; path: string }>;
        listEl: Element;
    }

    export abstract class ViewPluginEventable extends View {
        plugin: Plugin & Events;
    }

    export class TFileExplorerView extends View {
        fileItems: {
            [K: string]: TFileExplorerItem;
        };
        sortOrder: string;

        getDisplayText(): string;

        getViewType(): string;

        requestSort: () => void;
    }

    export class GraphNode {
        id: string;

        getDisplayText(): string;
    }

    export class GraphLeaf extends WorkspaceLeaf {
        view: GraphView;
    }

    export class GraphView extends View {
        renderer?: {
            nodes?: GraphNode[];
            onIframeLoad(): void;
        };

        getDisplayText(): string;

        getViewType(): string;
    }

    export class MarkdownViewExt extends MarkdownView {
        titleEl: HTMLDivElement;
        titleContainerEl: HTMLDivElement;
        inlineTitleEl: HTMLDivElement;
    }
    export abstract class CanvasViewExt extends FileView {
        canvas: Canvas;
    }

    export class Canvas {
        nodes: Map<string, CanvasNode>;
        requestFrame: (() => void) & { _originalFunc?: () => void };
    }

    export class CanvasNode {
        filePath: string;
        labelEl: HTMLDivElement;
        contentEl: HTMLDivElement;
        placeholderEl: HTMLDivElement;
        initialized: boolean;
        canvas: {
            view: CanvasViewExt;
        };
    }

    export abstract class Chooser {
        setSuggestions(e: any): any;
    }

    export interface SuggestModalChooserFileItem {
        downranked: boolean;
        file: TFile;
        type: "alias" | "file";
        alias?: string;
    }

    export interface SearchViewDOM {
        addResult(f: TFile, ...other: unknown[]): unknown;

        resultDomLookup: Map<TFile, unknown>;
    }

    export abstract class SearchPluginView extends View {
        dom: SearchViewDOM;
        startSearch: () => any;
    }

    export abstract class MarkdownLeaf extends WorkspaceLeaf {
        tabHeaderInnerTitleEl: Element;
        view: MarkdownView;
    }

    export abstract class MetadataCacheExt extends MetadataCache {
        getCachedFiles(): string[];
    }
}
