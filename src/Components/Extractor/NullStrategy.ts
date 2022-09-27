import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import { injectable } from "inversify";

@injectable()
export default class NullStrategy implements StrategyInterface {
    process(v: any): string | null {
        return null;
    }

    support(type: string): boolean {
        return type === "null";
    }
}
