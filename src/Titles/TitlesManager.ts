import {TAbstractFile} from "obsidian";

export default interface TitlesManager {
    isEnabled(): boolean;

    enable(): void;

    disable(): void;

    update(abstract: TAbstractFile|null = null): Promise<boolean>;
}