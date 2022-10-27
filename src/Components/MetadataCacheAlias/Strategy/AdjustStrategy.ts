import Alias from "@src/Components/MetadataCacheAlias/Alias";
import AbstractStrategy from "@src/Components/MetadataCacheAlias/Strategy/AbstractStrategy";

export default class AdjustStrategy extends AbstractStrategy {

    protected modify(alias: Alias, title: string): void {
        let value = alias.getValue() ?? [];
        if (!Array.isArray(value)) {
            value = [value];
        }
        value.push(title);
        alias.setValue(value);
    }

}