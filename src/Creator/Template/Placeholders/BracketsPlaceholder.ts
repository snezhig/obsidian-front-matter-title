import { inject, injectable } from "inversify";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import SI from "@config/inversify.types";
import { TemplatePlaceholderInterface } from "@src/Creator/Interfaces";

@injectable()
export default class BracketsPlaceholder implements TemplatePlaceholderInterface {
    private placeholder: string;
    private leftSpace = "";
    private rightSpace = "";
    private child: TemplatePlaceholderInterface;

    constructor(
        @inject<Factory>(SI["factory:placeholder"])
        private factory: Factory
    ) {}

    getPlaceholder(): string {
        return this.placeholder;
    }

    makeValue(path: string): string {
        const value = this.child.makeValue(path);
        return value ? `${this.leftSpace}${value}${this.rightSpace}` : null;
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
        const {
            groups: { left, key, right },
        } = this.placeholder.match(new RegExp(`^{{((?<left>\\s*)(?<key>.*\\b)(?<right>\\s*))}}`));
        this.leftSpace = left ?? "";
        this.rightSpace = right ?? "";
        this.child = this.factory.create(key);
    }
}
