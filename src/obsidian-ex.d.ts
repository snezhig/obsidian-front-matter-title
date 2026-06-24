import "obsidian";
import { Events, MarkdownView, MetadataCache, Plugin, TFile, TFolder, View, Workspace, WorkspaceLeaf } from "obsidian";

declare module "obsidian" {
    export class AppExt extends App {
        internalPlugins: {
            getEnabledPluginById: (id: string) => Plugin | null;
        };

        getAppTitle(text: string | null): string;
    }

    export interface WorkspaceInterface {
        updateTitle(): void;
    }

    export interface TFileExplorerItem {
        file: TFile | TFolder;
        /**
         * @deprecated After Obsidian 1.2.0, use `selfEl` instead.
         */
        titleEl?: HTMLDivElement;
        /**
         * @deprecated After Obsidian 1.2.0, use `innerEl` instead.
         */
        titleInnerEl?: HTMLDivElement;
        selfEl: HTMLDivElement;
        innerEl: HTMLDivElement;
        sort?: () => void;
        vChildren?: {
            setChildren(items: any[]): void;
        };

        updateTitle(): void;

        startRename(): void;

        getTitle(): string;
    }

    export abstract class BookmarksPluginLeaf extends WorkspaceLeafExt<BookmarksPluginView> {}
    export abstract class BookmarksPluginView extends ViewPluginEventable {
        plugin: Plugin & Events & { items: { type: string | "file"; title: string; path: string }[] };
        itemDoms: WeakMap<{ type: string | "file"; title: string; path: string }, { titleEl: Element }>;
    }

    export abstract class ViewPluginEventable extends View {
        plugin: Plugin & Events;
    }

    export class TFileExplorerLeaf extends WorkspaceLeafExt {
        view: TFileExplorerView;
    }

    export class TFileExplorerView extends View {
        fileItems: {
            [K: string]: TFileExplorerItem;
        };
        sortOrder: string;
        requestSort: () => void;

        getSortedFolderItems: (TFolder) => TFileExplorerItem[];

        getDisplayText(): string;

        getViewType(): string;
    }

    export class GraphNode {
        id: string;

        getDisplayText(): string;
    }

    export class GraphLeaf extends WorkspaceLeaf {
        view: GraphView;
    }

    export class WorkspaceLeafExt<T extends View = View> extends WorkspaceLeaf {
        id: string;
        view: T;
        isVisible(): boolean;
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
        leaf: WorkspaceLeafExt;
        backlinks: Backlink;
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

    export abstract class BacklinkViewExt extends View {
        backlink: Backlink;
    }

    export abstract class Backlink {
        backlinkDom: SearchDOM;
        unlinkedDom: SearchDOM;
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

    export interface SearchDOM {
        el: HTMLDivElement;
        resultDomLookup: Map<TFile, HTMLDivElement>;

        addResult(f: TFile, ...other: unknown[]): unknown;
    }

    export abstract class SearchPluginView extends View {
        dom: SearchDOM;
        startSearch: () => any;
    }

    export abstract class MarkdownLeaf extends WorkspaceLeaf {
        tabHeaderInnerTitleEl: Element;
        view: MarkdownView;
    }

    export abstract class MetadataCacheExt extends MetadataCache {
        getCachedFiles(): string[];
    }

    export class WorkspaceExt extends Workspace {
        updateTitle(): void;
    }
}
