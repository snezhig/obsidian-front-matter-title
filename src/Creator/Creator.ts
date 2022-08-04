import CreatorInterface from "../Interfaces/CreatorInterface";
import TemplateInterface from "../Interfaces/TemplateInterface";
import {inject, injectable, named} from "inversify";
import SI from '@config/inversify.types';

@injectable()
export default class Creator implements CreatorInterface {

    constructor(
        @inject(SI['creator.template']) @named('auto')
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