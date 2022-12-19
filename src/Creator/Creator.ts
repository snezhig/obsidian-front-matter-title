import CreatorInterface from "../Interfaces/CreatorInterface";
import TemplateInterface from "../Interfaces/TemplateInterface";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";
import TypeNotSupportedException from "@src/Components/Extractor/Exceptions/TypeNotSupportedException";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export default class Creator implements CreatorInterface {
    private templates: TemplateInterface[];

    constructor(
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>,
        @inject(SI["creator:template"])
        @named("all")
        private resolver: () => TemplateInterface[],
        @inject(SI.logger)
        @named("creator")
        private logger: LoggerInterface
    ) {
        this.templates = resolver();
        this.bind();
    }

    private bind(): void {
        this.dispatcher.addListener(
            "templates:changed",
            new CallbackVoid((): void => {
                this.templates = this.resolver();
            })
        );
    }

    create(path: string): string | null {
        for (const t of this.templates) {
            let template = t.getTemplate();

            for (const placeholder of t.getPlaceholders()) {
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
        }
        return null;
    }
}
