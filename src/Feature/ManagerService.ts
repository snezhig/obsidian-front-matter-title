import { ResolverInterface, ResolverServiceInterface } from "@src/Resolver/Interfaces";

export default class ManagerService {
    constructor(private service: ResolverServiceInterface) {}

    public createResolver(name: string): ResolverInterface | null {
        const main = this.service.create(`${name}:main`);
        const fallback = this.service.create(`${name}:fallback`);
        return {
            resolve(path: string): string | null {
                return main(path) ?? fallback(path);
            },
        };
    }
}
