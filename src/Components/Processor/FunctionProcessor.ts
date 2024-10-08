import { inject, injectable } from "inversify";
import ProcessorInterface from "./Interfaces";
import SI from "../../../config/inversify.types";
import { ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";

@injectable()
export default class FunctionProcessor implements ProcessorInterface {
    private readonly func: Function | null;

    constructor(
        @inject(SI["processor:args"])
        args: string[]
    ) {
        this.func = args?.[0] ? new Function("title", args[0]) : null;
    }

    process(value: string): string {
        return this.func?.(value) ?? value;
    }

    getType(): ProcessorTypes {
        return ProcessorTypes.Function;
    }
}
