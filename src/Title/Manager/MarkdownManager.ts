import Manager from "./Manager";
import {TAbstractFile} from "obsidian";

export default class MarkdownManager implements Manager{
    private enabled: boolean = false;
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