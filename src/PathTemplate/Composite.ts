import TemplateTitleUndefinedError from "../Errors/TemplateTitleUndefinedError";
import PathTemplateInterface from "./PathTemplateInterface";
import {CompositePattern} from "./Factory";

export default class Composite implements PathTemplateInterface {

    private metaPaths: string[] = [];
    private pattern = CompositePattern;

    constructor(
        private template: string
    ) {
        this.parse();
    }

    buildTitle(titles: { [p: string]: string | null }): string | null {
        let title = this.template;
        for (const path of this.metaPaths) {
            if (titles[path] === undefined) {
                throw new TemplateTitleUndefinedError(`Template path ${path} is undefined`);
            }
            title = title.replace(`{{${path}}}`, titles[path] ?? '');
        }
        return title?.length > 0 ? title : null;
    }

    getMetaPaths(): string[] {
        return this.metaPaths;
    }

    private parse(): void {
        const parts = this.template.match(new RegExp(this.pattern, 'g'));
        for (const part of parts) {
            const {groups: {title}} = part.match(this.pattern);
            this.metaPaths.push(title);
        }
    }

}
