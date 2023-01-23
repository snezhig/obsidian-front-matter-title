import { ResolverDynamicInterface } from "@src/Resolver/Interfaces";
import { CreatorInterface } from "@src/Interfaces/CreatorInterfaceAdapter";

export class Resolver implements ResolverDynamicInterface {
    private template: string = "";

    constructor(private creator: CreatorInterface) {}

    resolve(path: string): string | null {
        return this.creator.create(path, this.template);
    }

    setTemplate(template: string): void {
        this.template = template;
    }
}
