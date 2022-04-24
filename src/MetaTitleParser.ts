import {parseYaml, TFile} from "obsidian";
import EmptyMetaPathError from "./Errors/EmptyMetaPathError";

export default class MetaTitleParser {

	private static readonly REGEXP = /^---\n(?<yaml>.*?)---/s;


	public static async parse(metaPath: string, content: string): Promise<string | null> {
		if (metaPath === '') {
			throw new EmptyMetaPathError(`Meta path is empty (got "${metaPath}")`);
		}

		const keys = metaPath.split('.');
		const meta = await this.getMetadata(content);

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

	private static async getMetadata(content: string): Promise<{ [key: string]: any } | null> {
		const yaml = content.match(this.REGEXP)?.groups?.yaml;
		return yaml ? parseYaml(yaml) : null;
	}
}
