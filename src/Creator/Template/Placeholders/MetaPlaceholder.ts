import AbstractPlaceholder from "./AbstractPlaceholder";
import {inject, injectable} from "inversify";
import SI from "../../../../config/inversify.types";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";

@injectable()
export default class MetaPlaceholder extends AbstractPlaceholder {
    constructor(
        @inject(SI['component.extractor'])
        private extractor: ExtractorInterface,
        @inject(SI['factory:obsidian:file'])
        private factory: (path: string, type: string) => ({ [k: string]: any }),
    ) {
        super();
    }

    makeValue(path: string): string {
        return this.extractor.extract(this.placeholder, this.factory(path, 'meta'));
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
    }

}