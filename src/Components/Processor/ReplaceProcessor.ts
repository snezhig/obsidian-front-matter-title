import { inject, injectable } from "inversify";
import ProcessorInterface from "./Interfaces";
import SI from "../../../config/inversify.types";

@injectable()
export default class ReplaceProcessor implements ProcessorInterface {
    private pattern: RegExp;
    private replacement: string;
    constructor(
        @inject(SI["processor:args"])
        args: string[]
    ) {
        this.pattern = new RegExp(args?.[0] ?? null);
        this.replacement = args?.[1] ?? null;
    }
    process(value: string): string {
        return value.replace(this.pattern, this.replacement);
    }
}
