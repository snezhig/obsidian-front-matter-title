import { TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { ObsidianMetaFactory } from "@config/inversify.factory.types";
import AbstractPlaceholder from "./AbstractPlaceholder";

@injectable()
export default class HeadingPlaceholder extends AbstractPlaceholder {
    constructor(
        @inject(SI["factory:obsidian:meta"])
        private factory: ObsidianMetaFactory
    ) {
        super();
    }

    makeValue(path: string): string {
        return this.factory(path, "headings")?.[0]?.heading ?? "";
    }
}
