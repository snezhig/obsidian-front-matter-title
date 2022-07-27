import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";
import {inject} from "inversify";
import Factory from "@src/Creator/Template/Placeholders/Factory";
import TYPES from "@config/inversify.types";

export default class BracketsPlaceholder implements TemplatePlaceholderInterface {
    private placeholder: string;
    private child: TemplatePlaceholderInterface;

    constructor(
        @inject<Factory>(TYPES['creator.template.placeholder.factory'])
        private factory: Factory
    ) {
    }

    getPlaceholder(): string {
        return this.placeholder
    }

    makeValue(path: string): string {
        return this.child.makeValue(path);
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
        const {groups: {inside}} = this.placeholder.match(new RegExp(`^{{(?<inside>.*?)}}`));
        this.child = this.factory.create(inside);
    }

}