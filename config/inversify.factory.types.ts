import {MetadataCache, TFile} from "obsidian";
import {SF, SFC} from "@src/Settings/SettingsType";
import FeatureBuildInterface from "@src/Settings/Interface/FeatureBuildInterface";
import FunctionReplacer, {FunctionPropertyNames, Implementation} from "@src/Utils/FunctionReplacer";
import SettingBuilderInterface from "@src/Settings/Interface/SettingBuilderInterface";

export type ObsidianFileFactory<T = any> = (path: string) => T;
export type ObsidianMetaFactory<T = any> = (path: string, type: 'frontmatter' | 'headings') => T;
export type MetadataCacheFactory<T extends MetadataCache> = () => T;
export type SettingsFeatureBuildFactory = <K extends keyof SF | SFC = SFC>(type: string) => FeatureBuildInterface<K> | null
export type SettingsBuilderFactory = <T extends object>(type: string) => SettingBuilderInterface<T, keyof T>[];
export type ObsidianActiveFile = () => TFile | null;
export type FunctionReplacerFactory<Target, Method extends FunctionPropertyNames<Required<Target>>, O> = (
    target: Target,
    method: Method,
    args: O,
    implementation: Implementation<Target, Method, O>
) => FunctionReplacer<Target, Method, O>