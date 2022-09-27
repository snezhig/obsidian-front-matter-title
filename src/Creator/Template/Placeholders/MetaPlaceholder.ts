import AbstractPlaceholder from "./AbstractPlaceholder";
import { inject, injectable } from "inversify";
import SI from "../../../../config/inversify.types";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";
import { ObsidianMetaFactory } from "@config/inversify.factory.types";

@injectable()
export default class MetaPlaceholder extends AbstractPlaceholder {
    constructor(
        @inject(SI["component:extractor"])
        private extractor: ExtractorInterface,
        @inject(SI["factory:obsidian:meta"])
        private factory: ObsidianMetaFactory
    ) {
        super();
    }

    makeValue(path: string): string {
        return this.extractor.extract(this.placeholder, this.factory(path, "frontmatter"));
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
    }
}
