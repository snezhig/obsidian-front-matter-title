import AbstractStrategy from "@src/Feature/Alias/Strategy/AbstractStrategy";
import Alias from "@src/Feature/Alias/Alias";

export default class ReplaceStrategy extends AbstractStrategy {
    protected modify(alias: Alias, title: string): void {
        alias.setValue(title);
    }
}
