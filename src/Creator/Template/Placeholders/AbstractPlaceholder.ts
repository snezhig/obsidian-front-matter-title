import { TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import { injectable } from "inversify";

@injectable()
export default abstract class AbstractPlaceholder implements TemplatePlaceholderInterface {
    protected placeholder: string;

    getPlaceholder(): string {
        return this.placeholder;
    }

    abstract makeValue(path: string): string;

    abstract setPlaceholder(placeholder: string): void;
}
