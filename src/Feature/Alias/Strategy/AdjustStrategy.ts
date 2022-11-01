import AbstractStrategy from "@src/Feature/Alias/Strategy/AbstractStrategy";
import Alias from "@src/Feature/Alias/Alias";

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
