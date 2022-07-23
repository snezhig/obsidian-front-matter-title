import TemplatePlaceholderInterface from "../../../Interfaces/TemplatePlaceholderInterface";
import DispatcherInterface from "../../../EventDispatcher/Interfaces/DispatcherInterface";
import MetaPlaceholder from "./MetaPlaceholder";
import {injectable} from "inversify";

// const PREFIXES_LINK = {};
// const PREFIXES = Object.keys(PREFIXES_LINK);
@injectable()
export default abstract class AbstractPlaceholder implements TemplatePlaceholderInterface {
    protected placeholder: string;

    getPlaceholder(): string {
        return this.placeholder;
    }

    abstract makeValue(path: string): string;

    abstract setPlaceholder(placeholder: string): void;
}