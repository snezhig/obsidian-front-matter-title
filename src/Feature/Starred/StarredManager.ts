import { EventRef, StarredPluginView } from "obsidian";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature } from "@src/enum";
import AbstractManager from "@src/Feature/AbstractManager";

@injectable()
export default class StarredManager extends AbstractManager {
    private enabled = false;
    private view: StarredPluginView = null;
    private ref: EventRef = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface<Resolving.Sync>,
        @inject(SI.logger)
        @named("manager:starred")
        private logger: LoggerInterface
    ) {
        super();
    }

    async doUpdate(path?: string): Promise<boolean> {
        return this.onChanged(path)[path] === true;
    }

    async doRefresh(): Promise<{ [k: string]: boolean }> {
        return this.onChanged();
    }

    private initView(): boolean {
        const view = this.facade.getViewsOfType<StarredPluginView>("starred")?.[0] ?? null;
        if (view === null) {
            this.logger.log("Could not find a view of starred type");
            return false;
        }
        this.view = view;
        return true;
    }

    private subscribe(): boolean {
        const plugin = this.view.plugin ?? null;
        if (plugin === null) {
            this.logger.log("Leaf does not have a plugin");
            return false;
        }
        this.ref = plugin.on("changed", () => {
            this.logger.log("Triggered by event");
            this.onChanged();
        });
        return true;
    }

    private unsubscribe(): void {
        this.view.plugin.offref(this.ref);
        this.view.plugin.trigger("changed");
    }

    private onChanged(path: string = null): { [k: string]: boolean } {
        const listEl = this.view.listEl.findAll(".nav-file");
        const items = this.view.itemLookup;
        const result: { [k: string]: boolean } = {};
        for (const div of Array.from(listEl)) {
            const item = items.get(div);
            const content = div.find(".nav-file-title-content");
            result[item.path] = false;
            if (content && item.type === "file" && (!path || item.path === path)) {
                this.process(content, item.path, item.title).catch(console.error);
                result[item.path] = true;
            }
        }
        return result;
    }

    private async process(div: Element, path: string, original: string): Promise<void> {
        const title = this.resolver.resolve(path) ?? original;
        if (div.getText() !== title) {
            div.setText(title);
        }
    }

    doEnable(): void {
        if (!this.isEnabled() && this.initView() && this.subscribe()) {
            this.enabled = true;
        }
    }

    doDisable(): void {
        if (this.isEnabled()) {
            this.unsubscribe();
            this.view = null;
            this.enabled = false;
        }
    }

    static getId(): Feature {
        return Feature.Starred;
    }

    getId(): Feature {
        return StarredManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
