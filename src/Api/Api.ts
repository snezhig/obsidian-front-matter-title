import { ApiInterface } from "front-matter-plugin-api-provider";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";

@injectable()
export default class Api implements ApiInterface {
    constructor(
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface
    ) {}

    async resolve(path: string): Promise<string | null> {
        return this.resolveSync(path);
    }

    resolveSync(path: string): string | null {
        return this.resolver.resolve(path);
    }
}
