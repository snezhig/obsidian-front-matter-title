export type ResolverEvents = {
    "resolver.unresolved": { path?: string; all?: boolean };
    "resolver.clear": { path?: string; all?: boolean };
    "resolver:delete": { path: string };
};
