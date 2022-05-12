import {CachedMetadata} from "obsidian";
import EmptyMetaPathError from "./Errors/EmptyMetaPathError";

export default class MetaTitleParser {

	public static async parse(metaPath: string, metadata: CachedMetadata): Promise<string | null> {
		if (metaPath === '') {
			throw new EmptyMetaPathError(`Meta path is empty (got "${metaPath}")`);
		}

		const keys = metaPath.split('.');
		const meta = metadata.frontmatter ?? null;

		if (meta === null) {
			return null;
		}

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
				throw new TypeError(`value of "${metaPath}" path muse be string, ${typeof value} got`);
		}
	}
}
