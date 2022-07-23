import TemplateInterface from "../../Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../Interfaces/TemplatePlaceholderInterface";
import {inject, injectable} from "inversify";
import Factory from "./Placeholders/Factory";
import TYPES from "../../../config/inversify.types";

@injectable()
export default class Simple implements TemplateInterface {
    constructor(
        @inject('template')
        private template: string,
        @inject<Factory>(TYPES['creator.template.placeholder.factory'])
        private factory: Factory
    ) {
    }

    getPlaceholders(): TemplatePlaceholderInterface[] {
        return [this.factory.create(this.template)];
    }

    getTemplate(): string {
        return this.template;
    }
}