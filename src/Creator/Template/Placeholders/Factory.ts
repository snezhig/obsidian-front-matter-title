import {inject, injectable} from "inversify";
import TemplatePlaceholderInterface from "../../../Interfaces/TemplatePlaceholderInterface";

@injectable()
export default class Factory{
    constructor(
        @inject("Factory<Placeholder>")
        private factory: (type: string, placeholder: string) => TemplatePlaceholderInterface
    ) {
        console.log(factory('meta', 'test'));
    }
    public create(placeholder: string): TemplatePlaceholderInterface{
        return  this.factory('meta', placeholder);
    }
}