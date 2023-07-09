import { Backlink } from "obsidian";
import { ResolverInterface } from "../Resolver/Interfaces";
import { injectable } from "inversify";

@injectable()
export default class BacklinkHelper {
    public processTitles(backlink: Backlink, resolver: ResolverInterface, path: string = null, restore = false): void {
        const lookup = backlink?.backlinkDom?.resultDomLookup ?? new Map();
        for (const [file, item] of lookup.entries()) {
            if (path && file.path !== path) {
                continue;
            }
            const node = item.containerEl.firstElementChild;
            const text = (restore ? null : resolver.resolve(file.path)) ?? file.basename;
            if (node.getText() !== text) {
                item.containerEl.firstElementChild.setText(text);
            }
        }
    }
}