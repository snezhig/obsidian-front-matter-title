import EmptyMetaPathError from "../Errors/EmptyMetaPathError";
import {injectable} from "inversify";

export type Meta = { [k: string]: any };
@injectable()
export default class FrontMatterParser {
    private delimiter: null | string = null;

    public setDelimiter(delimiter: null | string): void {
        this.delimiter = delimiter;
    }

    public getDelimiter(): null | string {
        return this.delimiter;
    }

    public parse(metaPath: string, meta: Meta): string | null {
        if (metaPath === '') {
            throw new EmptyMetaPathError(`Meta path is empty (got "${metaPath}")`);
        }

        const keys = metaPath.split('.');

        let value = meta;
        for (const key of keys) {
            value = value?.[key] ?? null;

            if (value === null) {
                return null;
            }
        }

        switch (typeof value) {
            case "number":
                return String(value);
            case "string":
                return value;
            default: {
                if (Array.isArray(value)) {
                    return this.delimiter === null
                        ? (value[0] ?? null)
                        : value.filter(e => e).join(this.getDelimiter());
                }
                throw new TypeError(`value of "${metaPath}" path must be string or number, ${typeof value} got`);
            }
        }
    }
}
