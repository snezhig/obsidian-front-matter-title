import { PlaceholderType, TemplateInterface, TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import { injectable } from "inversify";

@injectable()
export default abstract class AbstractPlaceholder implements TemplatePlaceholderInterface {
    static readonly META: PlaceholderType = "meta";
    static readonly BRACKETS: PlaceholderType = "brackets";
    static readonly HEADING: PlaceholderType = "heading";
    static readonly FILE: PlaceholderType = "file";
    static readonly LOGIC: PlaceholderType = "logic";
    protected placeholder: string;

    getPlaceholder(): string {
        return this.placeholder;
    }

    abstract makeValue(path: string): string;

    setPlaceholder(placeholder: string): TemplatePlaceholderInterface {
        this.placeholder = placeholder;
        return this;
    }
}
