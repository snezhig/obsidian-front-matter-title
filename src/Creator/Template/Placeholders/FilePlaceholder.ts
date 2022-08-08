import TemplatePlaceholderInterface from "@src/Interfaces/TemplatePlaceholderInterface";
import AbstractPlaceholder from "@src/Creator/Template/Placeholders/AbstractPlaceholder";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";
import {inject} from "inversify";
import SI from "@config/inversify.types";

export default class FilePlaceholder extends AbstractPlaceholder {
    private path: string;

    constructor(
        @inject(SI['factory:obsidian:file'])
        private factory: (path: string, type: string) => ({ [k: string]: any }),
        @inject(SI['component:extractor'])
        private extractor: ExtractorInterface
    ) {
        super();
    }

    makeValue(path: string): string {
        return this.extractor.extract(this.path, this.factory(path, 'file'));
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
        this.path = placeholder.substring(1);
    }

}