import { Feature, Manager } from "@src/enum";
import { NoteLink } from "./Utils/FileNoteLinkService";
import { CachedMetadata, TFile } from "obsidian";

export type AppEvents = {
    "metadata:cache:changed": { file: TFile; data: string; cache: CachedMetadata };
    "templates:changed": { old: string[]; new: string[] };
    "manager:update": { id: Manager; result: boolean };
    "feature:state:changed": { id: Feature; enabled: boolean };
    "note:link:change:approve": {
        path: string;
        changes: [string, string][];
        approve: Promise<boolean>;
    };
    "note:link:filter": {
        links: NoteLink[];
    };
};
