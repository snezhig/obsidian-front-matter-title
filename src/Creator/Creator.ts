import CreatorInterface from "../Interfaces/CreatorInterface";
import TemplateInterface from "../Interfaces/TemplateInterface";
import {inject, injectable, named} from "inversify";
import SI from '@config/inversify.types';
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import {AppEvents} from "@src/Types";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";

@injectable()
export default class Creator implements CreatorInterface {
    private template: TemplateInterface;

    constructor(
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>,
        @inject(SI['creator:template']) @named('callback')
        private resolver: () => TemplateInterface
    ) {
        this.template = resolver();
        this.bind();
    }
    private bind(): void{
        this.dispatcher.addListener(
            'template:changed',
            new CallbackVoid((): void => {this.template = this. resolver()})
        )
    }

    create(path: string): string | null {
        let template = this.template.getTemplate();

        for (const placeholder of this.template.getPlaceholders()) {
            template = template.replace(placeholder.getPlaceholder(), placeholder.makeValue(path) ?? '');
        }

        return template?.length ? template : null;
    }


}