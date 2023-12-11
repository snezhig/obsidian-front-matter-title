import {
    TemplateInterface,
    TemplatePlaceholderFactoryInterface,
    TemplatePlaceholderInterface,
} from "@src/Creator/Interfaces";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";

@injectable()
export default class Composite implements TemplateInterface {
    private placeholders: TemplatePlaceholderInterface[] = [];
    private template: string;

    constructor(
        @inject(SI["template:pattern"])
        private pattern: string,
        @inject<TemplatePlaceholderFactoryInterface>(SI["factory:placeholder"])
        private factory: TemplatePlaceholderFactoryInterface
    ) {}

    getPlaceholders(): TemplatePlaceholderInterface[] {
        if (this.placeholders.length === 0) {
            const parts = this.template.match(new RegExp(this.pattern, "g"));

            for (const part of parts) {
                const {
                    groups: { placeholder },
                } = part.match(this.pattern);
                this.placeholders.push(this.factory.create(placeholder));
            }
        }

        return this.placeholders;
    }

    getTemplate(): string {
        return this.template;
    }

    setTemplate(template: string) {
        this.template = template;
    }
}
