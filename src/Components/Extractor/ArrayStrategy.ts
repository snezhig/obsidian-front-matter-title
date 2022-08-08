import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import {inject, injectable} from "inversify";
import SI from "@config/inversify.types";

@injectable()
export default class ArrayStrategy implements StrategyInterface {
    constructor(
        @inject(SI['delimiter'])
        private delimiter: string | null
    ) {
    }

    process(v: any[]): string | null {
        return v.length === 0
            ? null
            : (this.delimiter === null ? v[0] : v.join(this.delimiter));
    }

    support(type: string): boolean {
        return type === 'array';
    }

}