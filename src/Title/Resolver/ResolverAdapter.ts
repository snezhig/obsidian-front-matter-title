import ResolverInterface from "./ResolverInterface";
import Resolver from "./Resolver";

export default class ResolverAdapter implements ResolverInterface {
    constructor(
        private resolver: Resolver
    ) {
    }

    resolve(path: string): string | null {
        let title = null;
        if (!this.resolver.isResolved(path)) {
            title = this.resolver.makeTitle(path);
            this.resolver.resolve(path);
        } else {
            title = this.resolver.getResolved(path);
        }
        return title;
    }
}