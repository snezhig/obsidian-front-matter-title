export enum Resolving {
    Sync = "sync",
    Async = "async",
}

export type Return<T> = T extends Resolving.Async ? Promise<string | null> : string | null;
export default interface ResolverInterface<T extends Resolving = Resolving.Sync> {
    resolve(path: string): Return<T>;
}
