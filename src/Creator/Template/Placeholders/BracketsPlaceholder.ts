import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";
import { inject, injectable } from "inversify";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import SI from "@config/inversify.types";

@injectable()
export default class BracketsPlaceholder implements TemplatePlaceholderInterface {
    private placeholder: string;
    private child: TemplatePlaceholderInterface;

    constructor(
        @inject<Factory>(SI["factory:placeholder"])
        private factory: Factory
    ) {}

    getPlaceholder(): string {
        return this.placeholder;
    }

    makeValue(path: string): string {
        return this.child.makeValue(path);
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
        const {
            groups: { inside },
        } = this.placeholder.match(new RegExp(`^{{(?<inside>.*?)}}`));
        this.child = this.factory.create(inside);
    }
}
