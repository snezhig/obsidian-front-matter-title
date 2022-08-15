import FileModifiable from "@src/Obsidian/FileModifiable";
import {TFile} from "obsidian";
import VaultFacade from "@src/Obsidian/VaultFacade";

export default class File implements FileModifiable {
    constructor(
        private file: TFile,
        private facade: VaultFacade
    ) {
    }

    read(): Promise<string> {
        return this.facade.getFileContent(this.file);
    }

    modify(c: string): Promise<void> {
        return this.facade.modifyFile(this.file, c);
    }
}