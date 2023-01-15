import { CachedMetadata } from "obsidian";
import Alias from "./Alias";
import { ValidatorType } from "./Types";

export interface AliasManagerInterface {
    setStrategy(name: string): void;
    setValidator(validator: ValidatorType): void;
}

export interface ValidatorInterface {
    validate(metadata: CachedMetadata): boolean;
}

export interface StrategyInterface {
    process(alias: Alias, path: string): void;
}
