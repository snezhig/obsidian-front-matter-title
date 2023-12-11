import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";
import TypeNotSupportedException from "@src/Components/Extractor/Exceptions/TypeNotSupportedException";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import TemplateFactory from "@src/Creator/Template/Factory";
import { CreatorInterface, TemplateInterface } from "@src/Creator/Interfaces";

@injectable()
export default class Creator implements CreatorInterface {
    private cache: Map<string, TemplateInterface> = new Map();

    constructor(
        @inject(SI["factory:creator:template"])
        private factory: TemplateFactory,
        @inject(SI.logger)
        @named("creator")
        private logger: LoggerInterface
    ) {}

    create(path: string, template: string): string | null {
        for (const placeholder of this.pull(template).getPlaceholders()) {
            let value = "";
            try {
                value = placeholder.makeValue(path) ?? "";
            } catch (e) {
                if (e instanceof PathNotFoundException || e instanceof TypeNotSupportedException) {
                    this.logger.log(`Error by path: ${path}. ${e.message}`);
                } else {
                    throw e;
                }
            }
            template = template.replace(placeholder.getPlaceholder(), value);
        }
        if (template?.trim()?.length) {
            return template.trim();
        }
        return null;
    }

    private pull(template: string): TemplateInterface {
        const key = `template:${template}`;
        if (this.cache.has(key) === false) {
            this.logger.log(`Create template fo ${template}`);
            this.cache.set(key, this.factory.create(template));
        }
        return this.cache.get(key);
    }
}
