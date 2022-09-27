export default interface TemplatePlaceholderInterface {
    getPlaceholder(): string;

    makeValue(path: string): string;

    setPlaceholder(placeholder: string): void;
}
