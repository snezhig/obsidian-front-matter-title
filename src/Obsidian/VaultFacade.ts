import {TFile, Vault} from "obsidian";

export default class VaultFacade {
    constructor(
        private vault: Vault
    ) {

    }

    public getTFile(path: string): TFile | null {
        const file = this.vault.getAbstractFileByPath(path);
        return file instanceof TFile ? file : null;
    }

    public getFileContent(file: TFile): Promise<string> {
        return this.vault.cachedRead(file);
    }

    public modifyFile(file: TFile, c: string): Promise<void>{
        return this.vault.modify(file, c);
    }

}