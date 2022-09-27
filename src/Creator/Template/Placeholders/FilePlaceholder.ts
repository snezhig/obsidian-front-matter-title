import AbstractPlaceholder from "@src/Creator/Template/Placeholders/AbstractPlaceholder";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";
import { inject } from "inversify";
import SI from "@config/inversify.types";
import { ObsidianFileFactory } from "@config/inversify.factory.types";

export default class FilePlaceholder extends AbstractPlaceholder {
    private path: string;

    constructor(
        @inject(SI["component:extractor"])
        private extractor: ExtractorInterface,
        @inject(SI["factory:obsidian:file"])
        private factory: ObsidianFileFactory
    ) {
        super();
    }

    makeValue(path: string): string {
        return this.extractor.extract(this.path, this.factory(path));
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
        this.path = placeholder.substring(1);
    }
}
