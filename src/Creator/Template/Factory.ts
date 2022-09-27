import TemplateInterface from "../../Interfaces/TemplateInterface";
import { inject, injectable } from "inversify";
import SI from "../../../config/inversify.types";

@injectable()
export default class Factory {
    constructor(
        @inject(SI["template:pattern"])
        private pattern: string,
        @inject(SI["factory:template:resolver"])
        private factory: (named: string) => TemplateInterface
    ) {}

    public create(template: string): TemplateInterface {
        const type = new RegExp(this.pattern).test(template) ? "composite" : "simple";
        const obj = this.factory(type);
        obj.setTemplate(template);
        return obj;
    }
}
