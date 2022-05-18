import {TAbstractFile} from "obsidian";

export default interface Manager {
    isEnabled(): boolean;

    enable(): void;

    disable(): void;

    update(abstract?: TAbstractFile | null): Promise<boolean>;
}