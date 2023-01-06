import FilterInterface from "../Interfaces/FilterInterface";
import ResolverInterface, { Resolving, Return } from "../Interfaces/ResolverInterface";
import CreatorInterface from "../Interfaces/CreatorInterface";
import { inject, injectable, multiInject } from "inversify";
import SI from "../../config/inversify.types";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import Event from "@src/Components/EventDispatcher/Event";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

@injectable()
export default class ResolverSync implements ResolverInterface {
    constructor(
        @multiInject(SI.filter)
        private filters: FilterInterface[],
        @inject(SI.creator)
        private creator: CreatorInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<ResolverEvents>
    ) {}

    resolve(path: string): Return<Resolving.Sync> {
        return this.valid(path) ? this.get(path) : null;
    }

    private get(path: string): string | null {
        try {
            return this.dispatch(this.creator.create(path)) ?? null;
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
