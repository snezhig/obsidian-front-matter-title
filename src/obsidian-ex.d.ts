import 'obsidian';
import {MarkdownView, SuggestModal, TAbstractFile, TFile, View, WorkspaceLeaf} from "obsidian";

declare module 'obsidian' {
    export interface TFileExplorerItem {
        file: TAbstractFile,
        titleEl: HTMLDivElement,
        titleInnerEl: HTMLDivElement,
    }

    export class TFileExplorerView extends View {
        fileItems: {
            [K: string]: TFileExplorerItem
        };

        getDisplayText(): string;

        getViewType(): string;
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
