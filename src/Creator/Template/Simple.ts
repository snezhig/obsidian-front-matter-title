import TemplateInterface from "../../Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../Interfaces/TemplatePlaceholderInterface";

export default class Simple implements TemplateInterface {
    constructor(
        private template: string
    ) {
    }
    getPlaceholders(): TemplatePlaceholderInterface[] {
        return [];
    }

    getTemplate(): string {
        return this.template;
    }
}