import StrategyInterface from "./Interfaces/StrategyInterface";
import { injectable } from "inversify";

@injectable()
export default class BooleanStrategy implements StrategyInterface {
    process(v: boolean): string {
        return v ? "true" : "false";
    }

    support(type: string): boolean {
        return "boolean" === type;
    }
}
