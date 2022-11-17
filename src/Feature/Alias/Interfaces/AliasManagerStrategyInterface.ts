import Alias from "@src/Feature/Alias/Alias";

export default interface AliasManagerStrategyInterface {
    process(alias: Alias, path: string): void;
}
