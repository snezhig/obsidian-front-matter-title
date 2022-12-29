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
        try {
            this.pattern = new RegExp(args?.[0] ?? null, args?.[1]);
            this.replacement = args?.[2] ?? null;
        } catch (e) {
            console.error(e);
        }
    }
    process(value: string): string {
        return value.replace(this.pattern, this.replacement);
    }
}
