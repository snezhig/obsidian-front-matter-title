import {TAbstractFile} from "obsidian";

export default interface Manager {
    isEnabled(): boolean;

    enable(): Promise<void>|void;

    disable(): Promise<void>|void;

    update(abstract?: TAbstractFile | null): Promise<boolean>;
}