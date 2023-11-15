import {MetadataCacheExt, TFile, TFileExplorerItem, TFolder} from "obsidian";
import { ResolverInterface } from "../../Resolver/Interfaces";
import { injectable } from "inversify";
import {MetadataCacheFactory} from "@config/inversify.factory.types";

@injectable()
export class ExplorerFileItemMutator {
    constructor(private readonly item: TFileExplorerItem,
                private readonly resolver: ResolverInterface,
                private readonly factory: MetadataCacheFactory<MetadataCacheExt> ) {

        item.updateTitle = this.updateTitle.bind(this);
        item.startRename = this.startRename.bind(this);
    }

    private getProto(): TFileExplorerItem {
        return Object.getPrototypeOf(this.item);
    }

    /**
     * - tree-item
     *   - tree-item-self             <-- selfEl
     *     - tree-item-inner: title   <-- innerEl
     *     - nav-file-tag             <-- file tag, eg. png, svg
     *   - tree-item-children         <-- children nodes
     * @private
     */
    private updateTitle() {
        this.getProto().updateTitle.call(this.item);
        const title = this.resolver.resolve(this.item.file.path);
        title?.length > 0 && this.item.innerEl.setText(title);

        this.hook(this.item.file);
    }

    private startRename() {
        this.item.innerEl.setText(this.item.getTitle());
        this.getProto().startRename.call(this.item);

        this.hook(this.item.file);
    }

    private hook(file: TFile | TFolder) {
        const cache = this.factory();
        if (file instanceof TFile) {
            if (file.extension == 'md' && !file.basename.contains(".excalidraw.md")) {
                this.createOrUpdateExtraDiv(cache, file);
            }
        }
    }

    private createOrUpdateExtraDiv(cache: MetadataCacheExt, file: TFile) {
        const fileCache = cache.getFileCache(file);
        const id = fileCache?.frontmatter?.ID;
        const selfEl = this.item.selfEl;

        if (id) {
            const extras = selfEl.findAll(".tree-item-extra");
            if (!extras) {
                // create
                selfEl.createEl("div", {text: id, cls: "tree-item-extra nav-file-title-content"});
            } else if (extras.length == 1) {
                // update
                let single = extras[0];
                single.innerText = id;
            } else {
                extras.forEach((v) => {
                    console.error(`too much nodes for ${id} - ${v.id}`)
                    v.remove();
                })
                selfEl.createEl("div", {text: id, cls: "tree-item-extra nav-file-title-content"});
            }
        }
    }
    public destroy() {
        this.item.updateTitle = this.getProto().updateTitle;
        this.item.startRename = this.getProto().startRename;
    }
}
