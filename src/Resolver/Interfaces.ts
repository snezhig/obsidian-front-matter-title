export interface ResolverInterface {
    resolve(path: string): string | null;
}

export interface ResolverDynamicInterface extends ResolverInterface {
    setTemplate(template: string): void;
}

export interface ResolverServiceInterface {
    create(template: string): ResolverInterface;
    flush(): void;
}
