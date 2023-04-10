import { Feature } from "@src/Enum";
import { NoteLink } from "./Utils/FileNoteLinkService";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { SettingsEvent } from "@src/Settings/SettingsType";
import { TAbstractFile, TFile, CachedMetadata } from "obsidian";
import { NoteLinkChange } from "./Feature/NoteLink/NoteLinkTypes";

export type AppEvents = {
    "file:rename": { old: string; actual: string };
    "file:modify": TAbstractFile;
    "metadata:cache:changed": { path: string; cache: CachedMetadata };
    "manager:update": { id: Feature; result: boolean };
    "manager:refresh": { id: Feature };
    "feature:state:changed": { id: Feature; enabled: boolean };
    "feature:enable": { feature: FeatureInterface<any> };
    "note:link:changes:approve": {
        path: string;
        changes: NoteLinkChange[];
    };
    "note:link:changes:execute": {
        path: string;
        changes: NoteLinkChange[];
    };
    "note:link:filter": {
        links: NoteLink[];
    };
    "layout:change": undefined;
    "active:leaf:change": undefined;
    "file:open": TFile | null;
} & SettingsEvent;
