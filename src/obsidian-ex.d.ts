import 'obsidian';
import {TAbstractFile} from "obsidian";

declare module 'obsidian' {
	export interface TFileExplorerItem {
		file: TAbstractFile,
		titleEl: HTMLDivElement
	}

	export class TFileExplorer {
		fileItems: {
			[K: string]: TFileExplorerItem
		};
	}
}
