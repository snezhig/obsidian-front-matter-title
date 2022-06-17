import {TFile, Vault} from "obsidian";
import {expect} from "@jest/globals";
import ReservedParser from "../../../src/Title/ReservedParser";

const vault = new Vault();
const data = [
    {
        parts: ['_basename', 'title'], file: vault.getAbstractFileByPath('first'), expected() {
            return {_basename: this.file.basename}
        },
    },
    {
        parts: ['_basename', 'title', 'name', '_path'], file: vault.getAbstractFileByPath('second'), expected() {
            return {_basename: this.file.basename, _path: this.file.path}
        },
    },
    {
        parts: ['title'], file: vault.getAbstractFileByPath('third'), expected() {
            return {}
        },
    },
    {
        parts: ['_basename', '_path', '_name', '_extension'], file: vault.getAbstractFileByPath('four'), expected() {
            return {_basename: this.file.basename, _path: this.file.path, _name: this.file.name}
        },
    }
]

describe('Reserved Parser Test', () => {
    for (const item of data) {
        test(`Test parts ${item.parts.join(', ')}`, () => {
            const parser = new ReservedParser(item.parts);
            expect(parser.parse(item.file as TFile)).toEqual(item.expected());
        })
    }
});