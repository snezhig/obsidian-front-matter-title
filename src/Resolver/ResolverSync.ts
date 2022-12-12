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
        dispatcher.addListener({ name: "resolver:clear", cb: () => this.cache.clear() });
        dispatcher.addListener({ name: "resolver:delete", cb: this.handleDelete.bind(this) });
    }

    private handleDelete(e: EventInterface<ResolverEvents["resolver:delete"]>): void {
        const path = e.get().path;
        const old = this.cache.getItem(path);
        if (!old.isHit()) {
            return;
        }
        this.cache.delete(path);
        const actual = this.resolve(path);
        if (old.get() !== actual) {
            this.dispatcher.dispatch("resolver:unresolved", new Event({ path }));
        }
    }

    resolve(path: string): Return<Resolving.Sync> {
        return this.valid(path) ? this.get(path) : null;
    }

    private get(path: string): string | null {
        let title: string | null;
        const item = this.cache.getItem<string | null>(path);
        try {
            if (item.isHit() === false) {
                title = this.dispatch(this.creator.create(path));
                this.cache.save(item.set(title));
            } else {
                title = item.get();
            }
        } catch (e) {
            console.error(`Error by path ${path}`, e);
        }

        return title ?? null;
    }

    private dispatch(title: string): string {
        const event = new Event<ResolverEvents["resolver:resolved"]>({
            value: title,
            modify: function (v: string) {
                this.title = v;
            },
        });
        this.dispatcher.dispatch("resolver:resolved", event);
        return event.get().value;
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
