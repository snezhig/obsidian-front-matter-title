import { WorkspaceLeaf } from "obsidian";

export type getLeavesOfType<T extends WorkspaceLeaf = WorkspaceLeaf> = (viewType: string) => T[];
