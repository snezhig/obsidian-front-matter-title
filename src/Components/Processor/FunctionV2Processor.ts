import { inject, injectable } from "inversify";
import ProcessorInterface from "./Interfaces";
import SI from "../../../config/inversify.types";
import { FunctionV2ObjArg, ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import { App } from "obsidian";

@injectable()
export default class FunctionV2Processor implements ProcessorInterface {
    private readonly func: Function | null;
    private readonly app: App;

    constructor(
        @inject(SI["processor:args"])
        args: string[],
        @inject(SI["obsidian:app"])
        app: App
    ) {
        this.app = app;
        this.func = args?.[0] ? new Function("obj", "file", args[0]) : null;
    }

    process(value: string): string {
        const obj = JSON.parse(value) as FunctionV2ObjArg;
        const file = this.app.vault.getFileByPath(obj.path);
        return this.func?.(obj, file) ?? obj.title;
    }

    getType(): ProcessorTypes {
        return ProcessorTypes.FunctionV2;
    }
}
