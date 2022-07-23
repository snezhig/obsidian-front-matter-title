import {inject, injectable} from "inversify";
import TemplatePlaceholderInterface from "../../../Interfaces/TemplatePlaceholderInterface";
import TYPES from "../../../../config/inversify.types";

@injectable()
export default class Factory {
    constructor(
        @inject(TYPES['creator.template.placeholder.factory.resolver'])
        private factory: (type: string, placeholder: string) => TemplatePlaceholderInterface
    ) {
    }

    public create(placeholder: string): TemplatePlaceholderInterface {
        return this.factory('meta', placeholder);
    }
}