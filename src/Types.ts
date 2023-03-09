import { Feature } from "@src/enum";
import { NoteLink } from "./Utils/FileNoteLinkService";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { SettingsEvent } from "@src/Settings/SettingsType";

export type AppEvents = {
    "file:rename": { old: string; actual: string };
    "metadata:cache:changed": { path: string };
    "manager:update": { id: Feature; result: boolean };
    "manager:refresh": { id: Feature };
    "feature:state:changed": { id: Feature; enabled: boolean };
    "feature:enable": { feature: FeatureInterface<any> };
    "note:link:change:approve": {
        path: string;
        changes: [string, string][];
        approve: Promise<boolean>;
    };
    "note:link:filter": {
        links: NoteLink[];
    };
    "layout:change": undefined;
    "active:leaf:change": undefined;
} & SettingsEvent;
