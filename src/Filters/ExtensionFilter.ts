import FilterInterface from "../Interfaces/FilterInterface";
import { injectable } from "inversify";

@injectable()
export default class ExtensionFilter implements FilterInterface {
    check(path: string): boolean {
        return /.*\.md$/.test(path);
    }
}
