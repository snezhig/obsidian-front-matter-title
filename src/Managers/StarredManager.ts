import { Manager } from "@src/enum";
import ManagerInterface from "@src/Interfaces/ManagerInterface";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { EventRef, Events, StarredPluginView, ViewPluginEventable, WorkspaceLeaf } from "obsidian";

export default class StarredManager implements ManagerInterface {
    private enabled = false;
    private view: StarredPluginView = null;
    private ref: EventRef = null;
    constructor(private facade: ObsidianFacade, private resolver: ResolverInterface<Resolving.Sync>) {}
    update(path: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    private initView(): void {
        const leaf = this.facade.getLeavesOfType("starred")?.[0]?.view;
        this.view = (leaf as StarredPluginView) ?? null;
    }

    private subscribe(): void {
        const plugin = this.view.plugin;
        this.ref = plugin.on("changed", () => this.onChanged());
    }

    private unsubscribe(): void {
        this.view.plugin.offref(this.ref);
        this.view.plugin.trigger("changed");
    }

    private onChanged(): void {
        const listEl = this.view.listEl.getElementsByClassName("nav-file");
        const items = this.view.itemLookup;
        for (const div of Array.from(listEl)) {
            const item = items.get(div as HTMLDivElement);
            const content = div.getElementsByClassName("nav-file-title-content")?.[0];
            if (content) {
                this.process(content as HTMLDivElement, item.path);
            }
        }
    }
    private async process(div: HTMLDivElement, path: string): Promise<void> {
        const title = this.resolver.resolve(path);
        if (div.getText() !== title) {
            div.setText(title);
        }
    }

    async enable(): Promise<void> {
        this.initView();
        this.subscribe();
        this.enabled = true;
    }
    async disable(): Promise<void> {
        this.unsubscribe();
        this.view = null;
        this.enabled = false;
    }
    getId(): Manager {
        throw new Error("Method not implemented.");
    }
    isEnabled(): boolean {
        return this.enabled;
    }
}
