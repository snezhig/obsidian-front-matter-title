import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";
import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";

export default class Extractor implements ExtractorInterface {
    constructor(
        private strategies: StrategyInterface[]
    ) {
    }

    /**
     *
     * @param path
     * @param obj
     */
    extract(path: string, obj: { [p: string]: any }): string | null | never {

        return undefined;
    }



}

