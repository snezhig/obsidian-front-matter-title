import CreatorInterface from "../Interfaces/CreatorInterface";
import TemplateInterface from "../Interfaces/TemplateInterface";
import {inject, injectable, named} from "inversify";
import SI from '@config/inversify.types';
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import {AppEvents} from "@src/Types";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";

@injectable()
export default class Creator implements CreatorInterface {
    private templates: TemplateInterface[];

    constructor(
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>,
        @inject(SI['creator:template']) @named('all')
        private resolver: () => TemplateInterface[]
    ) {
        this.templates = resolver();
        this.bind();
    }

    private bind(): void {
        this.dispatcher.addListener(
            'template:changed',
            new CallbackVoid((): void => {
                this.templates = this.resolver()
            })
        )
        this.dispatcher.addListener(
            'template_fallback:changed',
            new CallbackVoid((): void => {
                this.templates = this.resolver()
            })
        )
    }

    create(path: string): string | null {
        for (const t of this.templates) {
            try {
                let template = t.getTemplate();

                for (const placeholder of t.getPlaceholders()) {
                    template = template.replace(placeholder.getPlaceholder(), placeholder.makeValue(path) ?? '');
                }
                if (template?.length) {
                    return template;
                }
            } catch (e) {
                //TODO: logs or exception handler
            }
        }
        return null;
    }


}