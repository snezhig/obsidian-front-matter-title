import { inject, injectable } from "inversify";
import { TemplatePlaceholderFactoryInterface, TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import SI from "@config/inversify.types";

@injectable()
export default class LogicPlaceholder implements TemplatePlaceholderInterface {
    private readonly DELIMITER = "|";
    private placeholder: string;
    private children: TemplatePlaceholderInterface[] = [];
    constructor(
        @inject<Factory>(SI["factory:placeholder"])
        private factory: TemplatePlaceholderFactoryInterface
    ) {}
    makeValue(path: string): string | null {
        for (const child of this.children) {
            const value = child.makeValue(path);
            if (value) {
                return value;
            }
        }
    }

    setPlaceholder(placeholder: string): TemplatePlaceholderInterface {
        this.placeholder = placeholder;
        for (const item of this.placeholder.split(this.DELIMITER)) {
            this.children.push(this.factory.create(item.trim()));
        }
        return this;
    }
    getPlaceholder(): string {
        return this.placeholder;
    }
}
