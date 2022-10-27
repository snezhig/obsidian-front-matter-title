import Alias from "@src/Components/MetadataCacheAlias/Alias";
import AbstractStrategy from "@src/Components/MetadataCacheAlias/Strategy/AbstractStrategy";

export default class ReplaceStrategy extends AbstractStrategy {
    protected modify(alias: Alias, title: string): void {
        alias.setValue(title);
    }
}