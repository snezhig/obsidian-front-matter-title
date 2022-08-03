import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import Container from "@config/inversify.config";

export default class App {
    private container = Container;
    private resolvers: {
        [Resolving.Sync]: ResolverInterface
        [Resolving.Async]: ResolverInterface<Resolving.Async>
    } = {};

    private bind(): void {
        //bind events from dispatcher
    }

    public getResolver<T extends keyof typeof Resolving>(type: T): ResolverInterface<Resolving[T]> {
        return this.resolvers[type];
    }
}
