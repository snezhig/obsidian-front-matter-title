import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import { injectable, inject, named } from "inversify";
import SI from "@config/inversify.types";

@injectable()
export default class ResolverAsync implements ResolverInterface<Resolving.Async> {
    constructor(
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private sync: ResolverInterface
    ) {}
    async resolve(path: string): Promise<string | null> {
        //Add queue to prevent race condition ???
        return this.sync.resolve(path);
    }
}
