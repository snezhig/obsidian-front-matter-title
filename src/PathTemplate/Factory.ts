import PathTemplateInterface from "./PathTemplateInterface";
import Composite from "./Composite";
import Simple from "./Simple";

export const CompositePattern = '{{(?<title>.*?)}}'

export default class Factory {
    public static create(template: string): PathTemplateInterface {
        const reg = new RegExp(CompositePattern);
        if (reg.test(template)) {
            return new Composite(template);
        }
        return new Simple(template);
    }
}
