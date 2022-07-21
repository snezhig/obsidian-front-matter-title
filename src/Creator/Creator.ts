import CreatorInterface from "../Interfaces/CreatorInterface";
import TemplateInterface from "../Interfaces/TemplateInterface";

export default class Creator implements CreatorInterface {

    constructor(
        private template: TemplateInterface
    ) {
    }

    create(path: string): string | null {
        let template = this.template.getTemplate();

        for (const placeholder of this.template.getPlaceholders()) {
            template = template.replace(placeholder.getPlaceholder(), placeholder.makeValue(path));
        }

        return template;
    }


}