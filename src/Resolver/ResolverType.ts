export type ResolverEvents = {
    "resolver:unresolved": { path: string };
    "resolver.clear": { path?: string; all?: boolean };
    "resolver:delete": { path: string };
    "resolver:clear": undefined;
};
