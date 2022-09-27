import { Feature, Manager } from "@src/enum";
import { NoteLink } from "./Utils/FileNoteLinkService";

export type AppEvents = {
    "templates:changed": { old: string[]; new: string[] };
    "manager:update": { id: Manager };
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
