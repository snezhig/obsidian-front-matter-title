import SI from "@config/inversify.types";
import CacheInterface from "@src/Components/Cache/CacheInterface";
import CacheItemInterface from "@src/Components/Cache/CacheItemInterface";
import Event from "@src/Components/EventDispatcher/Event";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { inject, injectable, named } from "inversify";
import { ResolverEvents } from "./ResolverType";
import { ResolverDynamicInterface } from "@src/Resolver/Interfaces";

import { AppEvents } from "@src/Types";
@injectable()
export default class ResolverCachedProxy implements ResolverDynamicInterface {
    private template: string;

    constructor(
        @inject(SI.resolver)
        @named("original")
        private resolver: ResolverDynamicInterface,
        @inject(SI.cache)
        private cache: CacheInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<ResolverEvents & AppEvents>
    ) {
        dispatcher.addListener({ name: "resolver:clear", cb: () => this.cache.clear(), sort: 0 });
        dispatcher.addListener({ name: "metadata:cache:changed", cb: e => this.handleDelete(e.get().path), sort: 0 });
        dispatcher.addListener({
            name: "file:rename",
            cb: e => {
                this.cache.delete(e.get().old);
                this.cache.save(this.cache.getItem(e.get().actual).set(null));
                this.handleDelete(e.get().actual);
            },
        });
    }

    private handleDelete(path: string): void {
        const item = this.cache.getItem<string | null>(path);

        if (!item.isHit()) {
            return;
        }
        const old = item.get();
        this.actualize(item);

        if (old !== item.get()) {
            this.dispatcher.dispatch("resolver:unresolved", new Event({ path }));
        }
    }

    resolve(path: string): string {
        return this.get(path);
    }

    private actualize(item: CacheItemInterface<string | null>): void {
        const title = this.resolver.resolve(item.getKey());
        this.cache.save(item.set(title));
    }

    private get(path: string): string | null {
        const item = this.cache.getItem<string | null>(path);
        if (item.isHit() === false) {
            this.actualize(item);
        }
        return item.get() ?? null;
    }

    setTemplate(template: string): void {
        this.template = template;
        this.resolver.setTemplate(template);
    }
}
