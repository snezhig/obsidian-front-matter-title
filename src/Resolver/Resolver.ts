import { ResolverDynamicInterface } from "@src/Resolver/Interfaces";
import { CreatorInterface } from "@src/Interfaces/CreatorInterfaceAdapter";
import { inject, injectable, multiInject } from "inversify";
import SI from "../../config/inversify.types";
import FilterInterface from "../Interfaces/FilterInterface";
import EventDispatcherInterface from "../Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { ResolverEvents } from "./ResolverType";
import Event from "../Components/EventDispatcher/Event";

@injectable()
export class Resolver implements ResolverDynamicInterface {
    private template: string = "";

    constructor(
        @multiInject(SI.filter)
        private filters: FilterInterface[],
        @inject(SI["creator:creator"])
        private creator: CreatorInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<ResolverEvents>
    ) {}

    setTemplate(template: string): void {
        this.template = template;
    }

    resolve(path: string): string | null {
        return this.valid(path) ? this.get(path) : null;
    }

    private get(path: string): string | null {
        try {
            return this.dispatch(this.creator.create(path, this.template)) ?? null;
        } catch (e) {
            console.error(`Error by path ${path}`, e);
        }

        return null;
    }

    private dispatch(title: string | null): string | null {
        const event = new Event<ResolverEvents["resolver:resolved"]>({
            value: title,
            modify(v: string) {
                this.value = v;
            },
        });
        this.dispatcher.dispatch("resolver:resolved", event);
        return event.get().value ?? null;
    }

    private valid(path: string): boolean {
        for (const filter of this.filters) {
            if (filter.check(path) === false) {
                return false;
            }
        }
        return true;
    }
}
