import ProcessorFactoryInterface from "./Interfaces/ProcessorFactoryInterface";

export enum ProcessorTypes {
    Function = "function",
    Replace = "replace",
}

export type ProcessorFactory = (type: ProcessorTypes) => ProcessorFactoryInterface;
