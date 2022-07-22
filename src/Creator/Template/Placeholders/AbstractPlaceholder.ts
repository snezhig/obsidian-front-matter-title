import TemplatePlaceholderInterface from "../../../Interfaces/TemplatePlaceholderInterface";
import DispatcherInterface from "../../../EventDispatcher/Interfaces/DispatcherInterface";
import MetaPlaceholder from "./MetaPlaceholder";

// const PREFIXES_LINK = {};
// const PREFIXES = Object.keys(PREFIXES_LINK);
export default abstract class AbstractPlaceholder implements TemplatePlaceholderInterface {
    public constructor(
        private placeholder: string,
        private dispatcher: DispatcherInterface<any>
    ) {
    }

    getPlaceholder(): string {
        return this.placeholder;
    }


    abstract makeValue(path: string): string;

    public static create(placeholder: string, dispatcher: DispatcherInterface<any>): TemplatePlaceholderInterface {
        return new MetaPlaceholder(placeholder, dispatcher);
    }
}