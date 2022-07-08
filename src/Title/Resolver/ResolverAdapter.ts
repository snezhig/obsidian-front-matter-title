import ResolverInterface from "./ResolverInterface";
import Resolver from "./Resolver";

export default class ResolverAdapter implements ResolverInterface {
    constructor(
        private resolver: Resolver
    ) {
    }

    resolve(path: string): string | null {
        return this.resolver.isResolved(path) ? this.resolver.getResolved(path) : null;
    }
}