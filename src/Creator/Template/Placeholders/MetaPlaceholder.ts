import AbstractPlaceholder from "./AbstractPlaceholder";
import {inject, injectable} from "inversify";
import TYPES from "../../../../config/inversify.types";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";

@injectable()
export default class MetaPlaceholder extends AbstractPlaceholder {
    constructor(
        @inject(TYPES['components.extractor'])
        private extractor: ExtractorInterface,
        @inject(TYPES['factory.meta'])
        private metaFactory: (path: string) => ({[k: string]: any})
    ) {
        super();
    }

    makeValue(path: string): string {
        return this.extractor.extract(this.placeholder, this.metaFactory(path));
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
    }

}