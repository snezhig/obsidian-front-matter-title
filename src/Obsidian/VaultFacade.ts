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
}