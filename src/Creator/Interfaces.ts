export interface CreatorInterface {
    create(path: string, template: string): string | null;
}

export interface TemplateInterface {
    getTemplate(): string;

    getPlaceholders(): TemplatePlaceholderInterface[];

    setTemplate(template: string): void;
}

export interface TemplatePlaceholderInterface {
    getPlaceholder(): string;

    makeValue(path: string): string | null;

    setPlaceholder(placeholder: string): void;
}
