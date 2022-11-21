import {MetadataCache, TFile} from "obsidian";
import {SF, SFC} from "@src/Settings/SettingsType";
import FeatureBuildInterface from "@src/Settings/Interface/FeatureBuildInterface";

export type ObsidianFileFactory<T = any> = (path: string) => T;
export type ObsidianMetaFactory<T = any> = (path: string, type: 'frontmatter' | 'headings') => T;
export type MetadataCacheFactory<T extends MetadataCache> = () => T;
export type SettingsFeatureBuildFactory = <K extends keyof SF | SFC = SFC>(type: string) => FeatureBuildInterface<K>|null
export type ObsidianActiveFile = () => TFile|null;