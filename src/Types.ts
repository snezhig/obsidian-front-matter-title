import { DeprecatedFeature, Feature } from "@src/enum";
import { NoteLink } from "./Utils/FileNoteLinkService";
import { CachedMetadata, TFile } from "obsidian";

export type AppEvents = {
    "alias:strategy:changed": string
    "metadata:cache:changed": { file: TFile; data: string; cache: CachedMetadata };
    "templates:changed": { old: string[]; new: string[] };
    "manager:update": { id: Feature; result: boolean };
    "feature:state:changed": { id: DeprecatedFeature; enabled: boolean };
    "note:link:change:approve": {
        path: string;
        changes: [string, string][];
        approve: Promise<boolean>;
    };
    "note:link:filter": {
        links: NoteLink[];
    };
};
