import { inject, injectable } from "inversify";
import TemplatePlaceholderInterface from "../../../Interfaces/TemplatePlaceholderInterface";
import SI from "../../../../config/inversify.types";

@injectable()
export default class Factory {
    constructor(
        @inject(SI["factory:placeholder:resolver"])
        private factory: (type: string, placeholder: string) => TemplatePlaceholderInterface
    ) {}

    public create(placeholder: string): TemplatePlaceholderInterface {
        let type = "meta";
        if (placeholder.startsWith("{{") && placeholder.endsWith("}}")) {
            type = "brackets";
        } else if (placeholder.startsWith("_")) {
            type = "file";
        } else if (placeholder === "#heading") {
            type = "heading";
        }
        return this.factory(type, placeholder);
    }
}
