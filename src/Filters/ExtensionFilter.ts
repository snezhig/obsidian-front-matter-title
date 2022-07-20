import FilterInterface from "../Interfaces/FilterInterface";

export default class ExtensionFilter implements FilterInterface {
    check(path: string): boolean {
        return /.*\.md$/.test(path);
    }
}