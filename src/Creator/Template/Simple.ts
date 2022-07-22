import TemplateInterface from "../../Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../Interfaces/TemplatePlaceholderInterface";
import AbstractPlaceholder from "./Placeholders/AbstractPlaceholder";

export default class Simple implements TemplateInterface {
    constructor(
        private template: string
    ) {
    }

    getPlaceholders(): TemplatePlaceholderInterface[] {
        return [AbstractPlaceholder.create(this.template)];
    }

    getTemplate(): string {
        return this.template;
    }
}