import { inject, injectable } from "inversify";
import { TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import SI from "../../../../config/inversify.types";
import AbstractPlaceholder from "@src/Creator/Template/Placeholders/AbstractPlaceholder";

@injectable()
export default class Factory {
    constructor(
        @inject(SI["factory:placeholder:resolver"])
        private factory: (type: string, placeholder: string) => TemplatePlaceholderInterface
    ) {}

    public create(placeholder: string): TemplatePlaceholderInterface {
        let type = AbstractPlaceholder.META;
        if (placeholder.startsWith("{{") && placeholder.endsWith("}}")) {
            type = AbstractPlaceholder.BRACKETS;
        } else if (placeholder.startsWith("_")) {
            type = AbstractPlaceholder.FILE;
        } else if (placeholder === "#heading") {
            type = AbstractPlaceholder.HEADING;
        } else if (placeholder.includes("|")) {
            type = AbstractPlaceholder.LOGIC;
        }
        return this.factory(type, placeholder).setPlaceholder(placeholder);
    }
}
