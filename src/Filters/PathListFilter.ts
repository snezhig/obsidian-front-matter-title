import FilterInterface from "../Interfaces/FilterInterface";
import BlackWhiteListInterface from "../Components/BlackWhiteList/BlackWhiteListInterface";

export default class PathListFilter implements FilterInterface {
    constructor(
        private list: BlackWhiteListInterface
    ) {
    }

    check(path: string): boolean {
        return this.list.isFileAllowed(path);
    }
}