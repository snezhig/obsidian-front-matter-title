import TemplateInterface from "@src/Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";
import {inject} from "inversify";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import TYPES from "@config/inversify.types";

export default class Composite implements TemplateInterface {
    private placeholders: TemplatePlaceholderInterface[] = [];

    constructor(
        @inject(TYPES['template.pattern'])
        private pattern: string,
        @inject(TYPES.template)
        private template: string,
        @inject<Factory>(TYPES['factory.placeholder'])
        private factory: Factory
    ) {
    }

    getPlaceholders(): TemplatePlaceholderInterface[] {
        if (this.placeholders.length === 0) {
            const parts = this.template.match(new RegExp(this.pattern, 'g'));

            for (const part of parts) {
                const {groups: {placeholder}} = part.match(this.pattern);
                this.placeholders.push(this.factory.create(placeholder))
            }
        }

        return this.placeholders;
    }

    getTemplate(): string {
        return this.template;
    }
}