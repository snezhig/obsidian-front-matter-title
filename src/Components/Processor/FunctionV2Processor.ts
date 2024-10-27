import { inject, injectable } from "inversify";
import ProcessorInterface from "./Interfaces";
import SI from "../../../config/inversify.types";
import { FunctionV2ObjArg, ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";

@injectable()
export default class FunctionV2Processor implements ProcessorInterface {
    private readonly func: Function | null;

    constructor(
        @inject(SI["processor:args"])
        args: string[],
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade
    ) {
        this.func = args?.[0] ? new Function("obj", args[0]) : null;
    }

    process(value: string): string {
        const obj = JSON.parse(value) as FunctionV2ObjArg;
        obj.file = this.facade.getTFile(obj.path);
        return this.func?.(obj) ?? obj.title;
    }

    getType(): ProcessorTypes {
        return ProcessorTypes.FunctionV2;
    }
}
