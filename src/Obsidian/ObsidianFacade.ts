import { AppExt, CachedMetadata, LinkCache, TFile, View, WorkspaceLeaf } from "obsidian";
import { Leaves } from "../Enum";

export default class ObsidianFacade {
    constructor(private app: AppExt) {}

    public isInternalPluginEnabled(id: string): boolean {
        return this.app.internalPlugins.getEnabledPluginById(id) !== null;
    }

    public getTFile(path: string): TFile | null {
        const file = this.app.vault.getAbstractFileByPath(path);
        return file instanceof TFile ? file : null;
    }

    public getFileContent(file: TFile): Promise<string> {
        return this.app.vault.cachedRead(file);
    }

    public modifyFile(file: TFile, c: string): Promise<void> {
        return this.app.vault.modify(file, c);
    }

    public getFileCache(path: string): CachedMetadata | null {
        return this.app.metadataCache.getCache(path);
    }

    public getFileLinksCache(path: string): LinkCache[] {
        return this.getFileCache(path)?.links ?? [];
    }

    public getLeavesOfType<T extends WorkspaceLeaf = WorkspaceLeaf>(type: string): T[] {
        return this.app.workspace.getLeavesOfType(type) as T[];
    }

    public getViewsOfType<T extends View = View>(type: Leaves): T[] {
        return this.getLeavesOfType(type).map(e => e.view) as T[];
    }

    public getFirstLinkpathDest(linkpath: string, from: string): TFile | null {
        return this.app.metadataCache.getFirstLinkpathDest(linkpath, "");
    }
    public getActiveLeaf(): WorkspaceLeaf | null {
        return this.app.workspace?.activeLeaf ?? null;
    }
}
