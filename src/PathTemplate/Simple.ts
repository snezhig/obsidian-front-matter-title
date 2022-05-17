import TemplateTitleUndefinedError from "../Errors/TemplateTitleUndefinedError";
import PathTemplateInterface from "./PathTemplateInterface";

    export default class Simple implements PathTemplateInterface {
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
