import {Feature} from "@src/enum";

export type AppEvents = {
    'templates:changed': { old: string[], new: string[] },
    'manager:explorer:update': undefined
    'manager:graph:update': undefined
    'manager:quick_switcher:update': undefined
    'manager:header:update': undefined,
    'feature:state:changed': {id: Feature, enabled: boolean}
}