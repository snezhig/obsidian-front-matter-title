import FilterInterface from "../Interfaces/FilterInterface";
import CacheInterface from "../Components/Cache/CacheInterface";
import ResolverInterface, { Resolving, Return } from "../Interfaces/ResolverInterface";
import CreatorInterface from "../Interfaces/CreatorInterface";
import { inject, injectable, multiInject } from "inversify";
import SI from "../../config/inversify.types";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";
import Event from "@src/Components/EventDispatcher/Event";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

@injectable()
export default class ResolverSync implements ResolverInterface {
    constructor(
        @multiInject(SI.filter)
        private filters: FilterInterface[],
        @inject(SI.cache)
        private cache: CacheInterface,
        @inject(SI.creator)
        private creator: CreatorInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<ResolverEvents>
    ) {
        dispatcher.addListener({ name: "resolver.clear", cb: this.handleClear.bind(this) });
    }

    private handleClear(
        e: EventInterface<ResolverEvents["resolver.clear"]>
    ): EventInterface<ResolverEvents["resolver.clear"]> {
        const { all = false, path } = e.get();
        if (all) {
            this.cache.clear();
        } else {
            this.cache.delete(path);
        }
        this.dispatcher.dispatch("resolver.unresolved", new Event(e.get()));
        return e;
    }

    resolve(path: string): Return<Resolving.Sync> {
        return this.valid(path) ? this.get(path) : null;
    }

    private get(path: string): string | null {
        let title: string | null;
        const item = this.cache.getItem<string | null>(path);
        try {
            if (item.isHit() === false) {
                title = this.creator.create(path);
                this.cache.save(item.set(title));
            } else {
                title = item.get();
            }
        } catch (e) {
            console.error(`Error by path ${path}`, e);
        }

        return title ?? null;
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
