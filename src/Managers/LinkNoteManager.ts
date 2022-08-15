import Manager from "@src/Title/Manager/Manager";
import {TAbstractFile} from "obsidian";
import SI, {FactoriesType} from "@config/inversify.types";
import {inject} from "inversify";

export default class LinkNoteManager implements Manager {
    private enabled = false;

    constructor(
        @inject(SI['factory:obsidian:file_modifiable'])
        private factory: FactoriesType['factory:obsidian:file_modifiable']
    ) {
    }

    disable(): void {
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    update(abstract?: TAbstractFile | null): Promise<boolean> {
        return Promise.resolve(false);
    }

}