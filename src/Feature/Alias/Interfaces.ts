import { CachedMetadata } from "obsidian";
import Alias from "./Alias";

export interface AliasManagerInterface {
    setStrategy(name: string): void;
}

export interface ValidateStrategyInterface {
    validate(metadata: CachedMetadata): boolean;
}

export interface AliasManagerStrategyInterface {
    process(alias: Alias, path: string): void;
}
