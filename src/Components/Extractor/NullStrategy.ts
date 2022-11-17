import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import { injectable } from "inversify";

@injectable()
export default class NullStrategy implements StrategyInterface {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    process(v: any): string | null {
        return null;
    }

    support(type: string): boolean {
        return type === "null";
    }
}
