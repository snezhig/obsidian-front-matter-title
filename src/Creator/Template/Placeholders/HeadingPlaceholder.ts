import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { ObsidianMetaFactory } from "@config/inversify.factory.types";

@injectable()
export default class HeadingPlaceholder implements TemplatePlaceholderInterface {
    private placeholder: string;

    constructor(
        @inject(SI["factory:obsidian:meta"])
        private factory: ObsidianMetaFactory
    ) {}

    getPlaceholder(): string {
        return this.placeholder;
    }

    makeValue(path: string): string {
        return this.factory(path, "headings")?.[0]?.heading ?? "";
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
    }
}
