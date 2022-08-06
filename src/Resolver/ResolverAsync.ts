import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";

export default class ResolverAsync implements ResolverInterface<Resolving.Async>{
    constructor(
        private sync: ResolverInterface
    ) {
    }
    async resolve(path: string): Promise<string|null> {
        //Add queue to prevent race condition ???
        return this.sync.resolve(path);
    }

}