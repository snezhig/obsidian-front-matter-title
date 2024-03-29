import { ResolverInterface, ResolverServiceInterface } from "@src/Resolver/Interfaces";
import { inject, injectable } from "inversify";
import SI from "../../config/inversify.types";

@injectable()
export default class FeatureService {
    constructor(
        @inject(SI["resolver:service"])
        private service: ResolverServiceInterface
    ) {}

    public createResolver(name: string): ResolverInterface | null {
        const main = this.service.createNamed(`${name}:main`);
        const fallback = this.service.createNamed(`${name}:fallback`);
        return {
            resolve(path: string): string | null {
                return main.resolve(path) ?? fallback.resolve(path);
            },
        };
    }
}
