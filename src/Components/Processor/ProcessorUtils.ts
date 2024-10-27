import ProcessorInterface from "./Interfaces";
import { TFile } from "obsidian";

export enum ProcessorTypes {
    Function = "function",
    FunctionV2 = "functionV2",
    Replace = "replace",
}

export type ProcessorFactory = (type: ProcessorTypes, args: string[]) => ProcessorInterface;

// Object that will be given into FunctionV2 processor as an "obj" argument
export type FunctionV2ObjArg = {
    // New file title
    title: string;
    // Path to file
    path: string;
    // TFile
    file: TFile | null;
};
