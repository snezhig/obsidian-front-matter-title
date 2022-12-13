export type ResolverEvents = {
    "resolver:unresolved": { path: string };
    "resolver.clear": { path?: string; all?: boolean };
    "resolver:delete": { path: string };
    "resolver:clear": undefined;
    "resolver:resolved": { value: string | null; modify: (v: string | null) => void };
};
