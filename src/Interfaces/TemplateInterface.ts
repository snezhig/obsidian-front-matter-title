import TemplatePlaceholderInterface from "./TemplatePlaceholderInterface";

export default interface TemplateInterface {
    getTemplate(): string;

    getPlaceholders(): TemplatePlaceholderInterface[];

    setTemplate(template: string): void;
}
