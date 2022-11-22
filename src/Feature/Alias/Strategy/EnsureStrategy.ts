import ReplaceStrategy from "@src/Feature/Alias/Strategy/ReplaceStrategy";
import Alias from "@src/Feature/Alias/Alias";

export default class EnsureStrategy extends ReplaceStrategy {
    process(alias: Alias, path: string): void {
        if (alias.getValue() === null) {
            super.process(alias, path);
        }
    }
}
