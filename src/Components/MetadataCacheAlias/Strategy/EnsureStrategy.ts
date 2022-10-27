import Alias from "@src/Components/MetadataCacheAlias/Alias";
import ReplaceStrategy from "@src/Components/MetadataCacheAlias/Strategy/ReplaceStrategy";

export default class EnsureStrategy extends ReplaceStrategy {
    process(alias: Alias, path: string): void {
        if (alias.getValue() === null) {
            super.process(alias, path);
        }
    }
}