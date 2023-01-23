import { ResolverInterface, ResolverServiceInterface } from "@src/Resolver/Interfaces";
import { NullResolverFactory, ResolverTemplateFactory } from "@src/Resolver/ResolverType";

export default class ResolverService implements ResolverServiceInterface {
    private resolvers: Map<string, ResolverInterface> = new Map();
    private templateNames: Map<string, Set<string>> = new Map();

    constructor(private factory: NullResolverFactory, private templateFactory: ResolverTemplateFactory) {}

    create(name: string) {
        const template = this.templateFactory(name);
        const resolver = this.getOrCreate(template);
        this.keepTemplateName(template, name);
        return resolver;
    }

    private getOrCreate(template: string): ResolverInterface {
        if (!this.resolvers.has(template)) {
            const resolver = this.factory();
            resolver.setTemplate(template);
            this.resolvers.set(template, resolver);
        }
        return this.resolvers.get(template);
    }

    private keepTemplateName(template: string, name: string) {
        if (!this.templateNames.has(template)) {
            this.templateNames.set(template, new Set());
        }
        this.templateNames.get(template).add(name);
    }

    flush() {
        this.templateNames.clear();
        this.resolvers.clear();
    }

    private handleUnresolved(): void {
        const template: string;
        for (const name of this.templateNames.get(template)) {
            const event = { template, name };
        }
    }
}
