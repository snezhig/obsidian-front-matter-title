import {parseYaml, TFile} from "obsidian";

export default class MetaTitleParser {

	private file: TFile;
	private readonly REGEXP = /^---\n(?<yaml>.*?)---/s;

	constructor(private file: TFile) {
	}

	public getFile(): TFile {
		return this.file;
	}

	public async parse(metaPath: string): Promise<string | null> {
		const keys = metaPath.split('.');
		const meta = await this.getMetadata();
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

		if (typeof value !== "string") {
			//TODO throw;
			return null;
		}

		return value;

	}

	private async getMetadata(): Promise<Object | null> {
		const content = await this.file.vault.read(this.file);
		const yaml = content.match(this.REGEXP)?.groups?.yaml;
		return yaml ? parseYaml(yaml) : null;
	}

}
