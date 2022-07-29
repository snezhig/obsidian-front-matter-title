import TemplateInterface from "../../Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../Interfaces/TemplatePlaceholderInterface";
import {inject, injectable} from "inversify";
import Factory from "./Placeholders/Factory";
import TYPES from "../../../config/inversify.types";

@injectable()
export default class Simple implements TemplateInterface {
    private placeholder: TemplatePlaceholderInterface = null;
    constructor(
        @inject(TYPES.template)
        private template: string,
        @inject<Factory>(TYPES['creator.template.placeholder.factory'])
        private factory: Factory
    ) {
    }

    getPlaceholders(): TemplatePlaceholderInterface[] {
        if(this.placeholder === null){
            this.placeholder = this.factory.create(this.template);
        }
        return [this.placeholder];
    }

    getTemplate(): string {
        return this.template;
    }
}