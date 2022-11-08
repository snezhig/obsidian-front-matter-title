import { Feature } from "@src/enum";
import { NoteLink } from "./Utils/FileNoteLinkService";

export type AppEvents = {
    "alias:strategy:changed": string;
    "templates:changed": { old: string[]; new: string[] };
    "manager:update": { id: Feature; result: boolean };
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
