import TemplateInterface from "../../Interfaces/TemplateInterface";
import {inject, injectable} from "inversify";
import TYPES from "../../../config/inversify.types";

@injectable()
export default class Factory {
    constructor(
        @inject(TYPES.template)
        private template: string,
        @inject(TYPES['template.pattern'])
        private pattern: string,
        @inject(TYPES['factory.template.resolver'])
        private factory: (named: string) => TemplateInterface
    ) {
    }

    public create(): TemplateInterface {
        const type = (new RegExp(this.pattern)).test(this.template) ? 'composite' : 'simple';
        return this.factory(type);
    }

}