import {Meta} from "../Title/FrontMatterParser";

export type EventEnum = {
    'resolver.unresolved': null | string,
    'resolve.meta': {path: string, meta?: Meta}
}