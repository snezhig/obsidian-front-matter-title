import TemplateInterface from "@src/Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";
import {inject} from "inversify";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import TYPES from "@config/inversify.types";

export default class Composite implements TemplateInterface {
    constructor(
        @inject(TYPES['template.pattern'])
        private pattern: string,
        @inject('template')
        private template: string,
        @inject<Factory>(TYPES['creator.template.placeholder.factory'])
        private factory: Factory
    ) {
    }

    getPlaceholders(): TemplatePlaceholderInterface[] {
        const parts = this.template.match(new RegExp(this.pattern, 'g'));
        const placeholders = [];

        for (const part of parts) {
            const {groups: {placeholder}} = part.match(this.pattern);
            placeholders.push(this.factory.create(placeholder))
        }

        return placeholders;
    }

    getTemplate(): string {
        return this.template;
    }
}