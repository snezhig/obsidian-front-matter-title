import { TemplatePlaceholderFactoryInterface, TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import { inject, injectable } from "inversify";
import SI from "../../../config/inversify.types";
import { TemplateInterface } from "@src/Creator/Interfaces";

@injectable()
export default class Simple implements TemplateInterface {
    private placeholder: TemplatePlaceholderInterface = null;
    private template: string;
    constructor(
        @inject<TemplatePlaceholderFactoryInterface>(SI["factory:placeholder"])
        private factory: TemplatePlaceholderFactoryInterface
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
