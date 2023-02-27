import { ApiInterface } from "front-matter-plugin-api-provider";
import { injectable } from "inversify";
import { ResolverInterface } from "@src/Resolver/Interfaces";

@injectable()
export default class Api implements ApiInterface {
    private resolver: ResolverInterface;

    async resolve(path: string): Promise<string | null> {
        return this.resolveSync(path);
    }

    resolveSync(path: string): string | null {
        return this.resolver.resolve(path);
    }

    setResolver(resolver: ResolverInterface): ApiInterface {
        this.resolver = resolver;
        return this;
    }
}
