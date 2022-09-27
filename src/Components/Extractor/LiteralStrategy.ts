import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import { injectable } from "inversify";

@injectable()
export default class LiteralStrategy implements StrategyInterface {
    support(type: string): boolean {
        return ["number", "string"].includes(type);
    }

    process(v: string | number): string | null {
        return v.toString();
    }
}
