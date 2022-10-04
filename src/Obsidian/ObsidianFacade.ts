import { CachedMetadata, LinkCache, MetadataCache, TFile, Vault, View, Workspace, WorkspaceLeaf } from "obsidian";

export default class ObsidianFacade {
    constructor(private vault: Vault, private metadataCache: MetadataCache, private workspace: Workspace) {}

    public getTFile(path: string): TFile | null {
        const file = this.vault.getAbstractFileByPath(path);
        return file instanceof TFile ? file : null;
    }

    public getFileContent(file: TFile): Promise<string> {
        return this.vault.cachedRead(file);
    }

    public modifyFile(file: TFile, c: string): Promise<void> {
        return this.vault.modify(file, c);
    }

    public getFileCache(path: string): CachedMetadata | null {
        return this.metadataCache.getCache(path);
    }

    public getFileLinksCache(path: string): LinkCache[] {
        return this.getFileCache(path)?.links ?? [];
    }

    public getLeavesOfType<T extends WorkspaceLeaf = WorkspaceLeaf>(type: string): T[] {
        return this.workspace.getLeavesOfType(type) as T[];
    }

    public getViewsOfType<T extends View = View>(type: string): T[] {
        return this.getLeavesOfType(type).map(e => e.view) as T[];
    }

    public getFirstLinkpathDest(linkpath: string): TFile | null {
        return this.metadataCache.getFirstLinkpathDest(linkpath, "");
    }
}
