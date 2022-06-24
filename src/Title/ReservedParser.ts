import {TFile} from "obsidian";

type Reserved = 'path' | 'basename' | 'name';
type ReservedPrefix = '_path' | '_basename' | '_name' | string;

type Return = { [key in ReservedPrefix]?: string };

const Reserved: Map<ReservedPrefix, Reserved> = new Map([['_path', 'path'], ['_basename', 'basename'], ['_name', "name"]]);
export default class ReservedParser {
    private parts: Map<Reserved, ReservedPrefix> = new Map();

    constructor(parts: (string | ReservedPrefix)[]) {
        for (const part of parts) {
            if (Reserved.has(part)) {
                this.parts.set(Reserved.get(part), part);
            }
        }
    }

    public parse(file: TFile): Return {
        const object: Return = {};

        for (const [k, p] of this.parts.entries()) {
            object[p] = file[k];
        }

        return object;
    }

}