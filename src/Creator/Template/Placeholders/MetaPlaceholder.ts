import AbstractPlaceholder from "./AbstractPlaceholder";

export default class MetaPlaceholder extends AbstractPlaceholder {
    makeValue(path: string): string {
        return "";
    }

}