import { PlaceholderType, TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import { injectable } from "inversify";

@injectable()
export default abstract class AbstractPlaceholder implements TemplatePlaceholderInterface {
    static readonly META: PlaceholderType = "meta";
    static readonly BRACKETS: PlaceholderType = "brackets";
    static readonly HEADING: PlaceholderType = "heading";
    static readonly FILE: PlaceholderType = "file";
    static readonly LOGIC: PlaceholderType = "logic";
    static readonly;
    protected placeholder: string;

    getPlaceholder(): string {
        return this.placeholder;
    }

    abstract makeValue(path: string): string;

    abstract setPlaceholder(placeholder: string): void;

    static abstract getType(): PlaceholderType;
    static abstract supports(placeholder: string): boolean;
}
