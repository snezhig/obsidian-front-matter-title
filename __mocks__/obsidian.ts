import * as fs from "fs";
import YAML from 'yaml'
import {EventEmitter} from "events";
import {TFileExplorerItem} from "obsidian";

export abstract class TAbstractFile {
	path: string;
	vault: Vault;
	basename: string;
}

export class TFolder extends TAbstractFile {

}

export class TFile extends TAbstractFile {

}

export class Vault extends EventEmitter {
	async read(file: TFile): Promise<string> {
		return fs.readFileSync(file.path, 'utf8');
	}

	trigger(name: string, ...data: any[]): void {
		this.emit(name, ...data);
	}

	getAbstractFileByPath(path: string): TFile {
		const file = new TFile();
		file.path = path;
		file.basename = `mock_${path}_basename`
		file.vault = new Vault();
		return file;
	}
}

export class TFileExplorer {
	fileItems: {
		[K: string]: TFileExplorerItem
	};
}

export function parseYaml(yaml: string) {
	return YAML.parse(yaml);
}
