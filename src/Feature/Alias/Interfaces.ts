import { CachedMetadata } from "obsidian";
import Alias from "./Alias";

export interface ValidatorInterface {
    validate(metadata: CachedMetadata): boolean;
}

export interface StrategyInterface {
    process(alias: Alias, path: string): void;
}
