import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import { injectable } from "inversify";

@injectable()
export default class NullStrategy implements StrategyInterface {
    // eslint-stop-next-line @typescript-eslint/no-unused-vars
    process(): string | null {
        return null;
    }

    support(type: string): boolean {
        return type === "null";
    }
}
