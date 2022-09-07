import * as fs from "fs";
import {EventEmitter} from "events";
import {CachedMetadata, TFileExplorerItem, WorkspaceLeaf} from "obsidian";

export function debounce(cb: () => any){
    return (...args: []) => cb(...args);
}

export abstract class TAbstractFile {
    path: string;
    vault: Vault;
    basename: string;
}


export class TFolder extends TAbstractFile {

}

export class TFile extends TAbstractFile {
    extension: string
    name: string
}

export class Vault extends EventEmitter {
    async read(file: TFile): Promise<string> {
        return fs.readFileSync(file.path, 'utf8');
    }

    trigger(name: string, ...data: any[]): void {
        this.emit(name, ...data);
    }

    getAbstractFileByPath(path: string): TAbstractFile|null {
        if(/.*\.md$/.test(path)) {
            const file = new TFile();
            file.basename = path.replace(/.*\/(.*)\.md/, '$1');
            file.extension = 'md'
            file.name = `${file.basename}.md`
            file.path = path;
            file.vault = new Vault();
            return file;
        }
        return null;
    }
}

export class TFileExplorer {
    fileItems: {
        [K: string]: TFileExplorerItem
    };
}


export class Workspace extends EventEmitter {
    getLeavesOfType(viewType: string): WorkspaceLeaf[] {
        return [];
    }

    trigger(name: string, ...data: any[]): void {
        this.emit(name, ...data);
    }


}

export class GraphLeaf {

}

export class GraphNode {
    getDisplayText() {

    }
}

export class MetadataCache {
    public getCache(path: string): CachedMetadata | null {
        return null;
    }
}