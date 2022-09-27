import TemplateInterface from "../../Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../Interfaces/TemplatePlaceholderInterface";
import { inject, injectable } from "inversify";
import Factory from "./Placeholders/Factory";
import SI from "../../../config/inversify.types";

@injectable()
export default class Simple implements TemplateInterface {
    private placeholder: TemplatePlaceholderInterface = null;
    private template: string;
    constructor(
        @inject<Factory>(SI["factory:placeholder"])
        private factory: Factory
    ) {}

    getPlaceholders(): TemplatePlaceholderInterface[] {
        if (this.placeholder === null) {
            this.placeholder = this.factory.create(this.template);
        }
        return [this.placeholder];
    }

    getTemplate(): string {
        return this.template;
    }

    setTemplate(template: string) {
        this.template = template;
    }
}
