import { TFileExplorerItem } from "obsidian";
import { ResolverInterface } from "../../Resolver/Interfaces";
import { injectable } from "inversify";

@injectable()
export class ExplorerFileItemMutator {
    constructor(private readonly item: TFileExplorerItem, private readonly resolver: ResolverInterface) {
        item.updateTitle = this.updateTitle.bind(this);
        item.startRename = this.startRename.bind(this);
    }

    private getProto(): TFileExplorerItem {
        return Object.getPrototypeOf(this.item);
    }
    private updateTitle() {
        this.getProto().updateTitle.call(this.item);
        const title = this.resolver.resolve(this.item.file.path);
        title?.length > 0 && this.item.innerEl.setText(title);
    }

    private startRename() {
        this.item.innerEl.setText(this.item.getTitle());
        return this.getProto().startRename.call(this.item);
    }
    public destroy() {
        this.item.updateTitle = this.getProto().updateTitle;
        this.item.startRename = this.getProto().startRename;
    }
}
