import FilterInterface from "../Interfaces/FilterInterface";
import CacheInterface from "../Components/Cache/CacheInterface";
import ResolverInterface, {Resolving, Return} from "../Interfaces/ResolverInterface";
import CreatorInterface from "../Interfaces/CreatorInterface";
import {inject, injectable, multiInject} from "inversify";
import TYPES from "../../config/inversify.types";

@injectable()
export default class ResolverSync implements ResolverInterface {
    constructor(
        @multiInject(TYPES.filter)
        private filters: FilterInterface[],
        @inject(TYPES.cache)
        private cache: CacheInterface,
        @inject(TYPES.creator)
        private creator: CreatorInterface
    ) {
    }

    resolve(path: string): Return<Resolving.Sync> {
        return this.valid(path) ? this.get(path) : null;
    }

    private get(path: string): string | null {
        let title: string | null;
        const item = this.cache.getItem<string | null>(path);

        if (item.isHit() === false) {
            title = this.creator.create(path);
            this.cache.save(item.set(title));
        } else {
            title = item.get();
        }

        return title;
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