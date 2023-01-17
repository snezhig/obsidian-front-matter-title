import TemplateInterface from "../Interfaces/TemplateInterface";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";
import TypeNotSupportedException from "@src/Components/Extractor/Exceptions/TypeNotSupportedException";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import CacheInterface from "@src/Components/Cache/CacheInterface";
import TemplateFactory from "@src/Creator/Template/Factory";
import { CreatorInterface } from "@src/Interfaces/CreatorInterfaceAdapter";

@injectable()
export default class Creator implements CreatorInterface {
    constructor(
        @inject(SI["cache"])
        private cache: CacheInterface,
        @inject(SI["factory:creator:template"])
        private factory: TemplateFactory,
        @inject(SI.logger)
        @named("creator")
        private logger: LoggerInterface
    ) {}

    private pull(template: string): TemplateInterface {
        const item = this.cache.getItem<TemplateInterface>(`template:${template}`);
        if (!item.isHit()) {
            this.logger.log(`Create template fo ${template}`);
            item.set(this.factory.create(template));
            this.cache.save(item);
        }
        return item.get();
    }

    create(path: string, template: string): string | null {
        for (const placeholder of this.pull(template).getPlaceholders()) {
            let value = "";
            try {
                value = placeholder.makeValue(path) ?? "";
            } catch (e) {
                if (e instanceof PathNotFoundException || e instanceof TypeNotSupportedException) {
                    this.logger.log(`Error by path: ${path}`, e);
                } else {
                    throw e;
                }
            }
            template = template.replace(placeholder.getPlaceholder(), value);
        }
        if (template?.trim()?.length) {
            return template;
        }
        return null;
    }
}
