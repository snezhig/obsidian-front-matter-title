export default interface ResolverStorageInterface {
    get(path: string): string | null;
    has(path: string): boolean;
    set(path: string, value: string | null): void;
    delete(path: string): void;
}
