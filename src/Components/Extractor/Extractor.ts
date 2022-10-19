import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";
import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";
import TypeNotSupportedException from "@src/Components/Extractor/Exceptions/TypeNotSupportedException";
import { injectable, multiInject } from "inversify";
import SI from "@config/inversify.types";

@injectable()
export default class Extractor implements ExtractorInterface {
    constructor(
        @multiInject(SI["component:extractor:strategy"])
        private strategies: StrategyInterface[]
    ) {}

    /**
     * @throws {PathNotFoundException}
     * @throws {TypeNotSupportedException}
     * @param path
     * @param obj
     */
    extract(path: string, obj: { [p: string]: any }): string | null | never {
        const parts = path.split(".");

        let part: string;
        let extracted = obj;

        while ((part = parts.shift())) {
            extracted = this.extractInternal(part, extracted);
        }

        let strategy: StrategyInterface = null;
        let type = extracted === null ? "null" : (typeof extracted as string);
        type = type === "object" && Array.isArray(extracted) ? "array" : type;
        for (const item of this.strategies) {
            if (item.support(type)) {
                strategy = item;
                break;
            }
        }
        if (strategy === null) {
            throw new TypeNotSupportedException(`Type ${type} is not supported`);
        }

        return strategy.process(extracted);
    }

    /**
     * @throws {PathNotFoundException}
     * @param key
     * @param obj
     * @private
     */
    private extractInternal(key: string, obj: { [p: string]: any }): any | never {
        if (obj === undefined || obj?.[key] === undefined) {
            throw new PathNotFoundException(`Key ${key} not found in ${JSON.stringify(obj)}`);
        }
        return obj[key];
    }
}
