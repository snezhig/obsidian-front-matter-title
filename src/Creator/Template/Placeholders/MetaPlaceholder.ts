import AbstractPlaceholder from "./AbstractPlaceholder";
import {inject, injectable} from "inversify";
import FrontMatterParser, {Meta} from "../../../Title/FrontMatterParser";
import TYPES from "../../../../config/inversify.types";

@injectable()
export default class MetaPlaceholder extends AbstractPlaceholder {
    constructor(
        private parser: FrontMatterParser,
        @inject(TYPES['factory.meta'])
        private metaFactory: (path: string) => Meta
    ) {
        super();
    }

    makeValue(path: string): string {
        return this.parser.parse(this.placeholder, this.metaFactory(path));
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder;
    }

}