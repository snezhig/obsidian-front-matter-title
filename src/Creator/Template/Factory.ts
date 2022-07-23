import TemplateInterface from "../../Interfaces/TemplateInterface";
import {inject, injectable} from "inversify";
import TYPES from "../../../config/inversify.types";

@injectable()
export default class Factory {
    constructor(
        @inject('template')
        private template: string,
        @inject(TYPES['creator.template.factory.resolver'])
        private factory: (named: string) => TemplateInterface
    ) {
    }

    public create(): TemplateInterface {
        return this.factory('simple');
    }
}