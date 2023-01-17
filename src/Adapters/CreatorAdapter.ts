import CreatorInterfaceAdapter, { CreatorInterface } from "@src/Interfaces/CreatorInterfaceAdapter";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";

@injectable()
export default class CreatorAdapter implements CreatorInterfaceAdapter {
    private templates: string[];

    constructor(
        @inject(SI["creator:creator"])
        private creator: CreatorInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["factory:templates"])
        private factory: () => string[]
    ) {
        this.templates = factory();
        this.bind();
    }

    private bind(): void {
        this.dispatcher.addListener({
            name: "settings:changed",
            cb: () => (this.templates = this.factory()),
        });
    }

    create(path: string): string | null {
        for (const t of this.templates) {
            const template = this.creator.create(path, t);
            if (template) {
                return template;
            }
        }
        return null;
    }
}
