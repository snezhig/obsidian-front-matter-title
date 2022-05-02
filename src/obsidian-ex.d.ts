import 'obsidian';
import {TAbstractFile, View, WorkspaceLeaf} from "obsidian";

declare module 'obsidian' {
	export interface TFileExplorerItem {
		file: TAbstractFile,
		titleEl: HTMLDivElement,
		titleInnerEl: HTMLDivElement,
	}

	export class TFileExplorer extends View{
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
		getDisplayText(): string;

		getViewType(): string;

		renderer?: {
			nodes?: GraphNode[],
			onIframeLoad(): void
		}
	}
}
