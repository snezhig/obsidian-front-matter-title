import TemplateTitleUndefinedError from "../Errors/TemplateTitleUndefinedError";
import PathTemplateInterface from "./PathTemplateInterface";
import {CompositePattern} from "./Factory";

export default class Composite implements PathTemplateInterface {

    private pattern = CompositePattern;
    private placeholders: Map<string, string> = new Map();

    constructor(
        private template: string
    ) {
        this.parse();
    }

    buildTitle(titles: { [p: string]: string | null }): string | null {
        let title = this.template;
        for (const [path, placeholder] of this.placeholders.entries()) {
            if (titles[path] === undefined) {
                throw new TemplateTitleUndefinedError(`Template path ${path} is undefined`);
            }
            title = title.replace(`{{${placeholder}}}`, titles[path] ?? '');
        }
        return title?.length > 0 ? title : null;
    }

    getMetaPaths(): string[] {
        return Array.from(this.placeholders.keys());
    }

    private parse(): void {
        const parts = this.template.match(new RegExp(this.pattern, 'g'));
        for (const part of parts) {
            const {groups: {title}} = part.match(this.pattern);
            this.placeholders.set(title.trim(), title);
        }
    }

}
