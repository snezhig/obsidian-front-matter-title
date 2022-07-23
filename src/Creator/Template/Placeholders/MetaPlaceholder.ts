import AbstractPlaceholder from "./AbstractPlaceholder";
import {injectable} from "inversify";

@injectable()
export default class MetaPlaceholder extends AbstractPlaceholder {
    makeValue(path: string): string {
        return "";
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
    }

}