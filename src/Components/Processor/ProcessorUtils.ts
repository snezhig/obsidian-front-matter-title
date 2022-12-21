import ProcessorInterface from "./Interfaces";

export enum ProcessorTypes {
    None = "none",
    Function = "function",
    Replace = "replace",
}

export type ProcessorFactory = (type: ProcessorTypes, args: string[]) => ProcessorInterface;
