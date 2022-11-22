import { inject, injectable, named } from "inversify";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import SI from "@config/inversify.types";
import AliasManagerStrategyInterface from "@src/Feature/Alias/Interfaces/AliasManagerStrategyInterface";
import Alias from "@src/Feature/Alias/Alias";

@injectable()
export default abstract class AbstractStrategy implements AliasManagerStrategyInterface {
    constructor(
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface
    ) {}

    process(alias: Alias, path: string): void {
        const title = this.resolver.resolve(path);
        if (title) {
            this.modify(alias, title);
        }
    }

    protected abstract modify(alias: Alias, title: string): void;
}
