import 'obsidian';
import {MarkdownView, SuggestModal, TFile, TFolder, View, WorkspaceLeaf} from "obsidian";

declare module 'obsidian' {
    export interface TFileExplorerItem {
        file: TFile|TFolder,
        titleEl: HTMLDivElement,
        titleInnerEl: HTMLDivElement,
        sort?: () => void,
        vChildren?: {
            setChildren(items: any[]): void
        }
    }

    export class TFileExplorerView extends View {
        fileItems: {
            [K: string]: TFileExplorerItem
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
        view: GraphView
    }

    export class GraphView extends View {
        renderer?: {
            nodes?: GraphNode[],
            onIframeLoad(): void
        }

        getDisplayText(): string;

        getViewType(): string;
    }

    export class MarkdownViewExt extends MarkdownView {
        titleEl: HTMLDivElement
        titleContainerEl: HTMLDivElement
    }

    export abstract class SuggestModalExt<T> extends SuggestModal<T> {
        chooser?: SuggestModalChooser<any> | any
    }

    export abstract class SuggestModalChooser<T> {
        setSuggestions(e: T): any;
    }

    export interface SuggestModalChooserFileItem {
        downranked: boolean,
        file: TFile,
        type: "alias" | "file",
        alias?: string
    }
}
