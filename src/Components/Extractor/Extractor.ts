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
        const parts = path.split('.');

        let part: string;
        let extracted = obj;

        while ((part = parts.shift())) {
            extracted = this.extractInternal(part, extracted);
        }

        return undefined;
    }

    /**
     * @throws {PathNotFoundException}
     * @param key
     * @param obj
     * @private
     */
    private extractInternal(key: string, obj: { [p: string]: any }): any | never {
        if (!obj.hasOwnProperty(key)) {
            throw new PathNotFoundException(`Key ${key} not found in ${obj.toString()}`);
        }
        return obj[key];
    }


}

