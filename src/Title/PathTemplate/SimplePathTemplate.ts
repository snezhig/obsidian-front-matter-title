import PathTemplateParser from "./PathTemplateParser";
import TemplateTitleUndefinedError from "../../Errors/TemplateTitleUndefinedError";

export default class SimplePathTemplate implements PathTemplateParser {
    constructor(
        private template: string
    ) {
    }

    buildTitle(titles: { [p: string]: string | null }): string | null {
        if (titles[this.template] === undefined) {
            throw new TemplateTitleUndefinedError(`Title path ${this.template} is undefined`);
        }
        const title = titles[this.template];
        return title?.length > 0 ? title : null;
    }

    getMetaPaths(): string[] {
        return [this.template];
    }

}