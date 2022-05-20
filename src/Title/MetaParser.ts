
import EmptyMetaPathError from "../Errors/EmptyMetaPathError";

export type Meta = { [k: string]: any };
export default class MetaParser {

    public static parse(metaPath: string, meta: Meta): string | null {
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
			default:
				throw new TypeError(`value of "${metaPath}" path must be string or number, ${typeof value} got`);
		}
	}
}
