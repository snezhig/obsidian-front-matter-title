import Alias from "@src/Components/MetadataCacheAlias/Alias";

export default interface AliasModifierStrategyInterface {
    process(alias: Alias, path: string): void;
}
