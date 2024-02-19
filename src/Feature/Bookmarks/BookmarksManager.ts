import { BookmarksPluginView, EventRef } from "obsidian";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature, Leaves } from "@src/Enum";
import AbstractFeature from "@src/Feature/AbstractFeature";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import FeatureService from "@src/Feature/FeatureService";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";

@injectable()
export default class BookmarksManager extends AbstractFeature<Feature> {
    private enabled = false;
    private view: BookmarksPluginView = null;
    private ref: EventRef = null;
    private metaRef: ListenerRef<"metadata:cache:changed"> = null;
    private resolver: ResolverInterface;
    private requestUpdate: () => void;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["feature:service"])
        service: FeatureService,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI.logger)
        @named("manager:bookmarks")
        private logger: LoggerInterface
    ) {
        super();
        this.requestUpdate = () => setTimeout(this.onChanged.bind(this), 100);
        this.metaRef = this.dispatcher.addListener({
            name: "metadata:cache:changed",
            cb: this.requestUpdate.bind(this),
        });
        this.resolver = service.createResolver(this.getId());
    }

    static getId(): Feature {
        return Feature.Bookmarks;
    }

    enable(): void {
        if (!this.isEnabled() && this.initView() && this.subscribe()) {
            this.enabled = true;
            this.requestUpdate();
        }
    }

    disable(): void {
        if (this.isEnabled()) {
            this.unsubscribe();
            this.view = null;
            this.enabled = false;
        }
    }

    getId(): Feature {
        return BookmarksManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    private initView(): boolean {
        const view = this.facade.getViewsOfType<BookmarksPluginView>(Leaves.Bookmarks)?.[0] ?? null;
        if (view === null) {
            this.logger.log("Could not find a view of bookmarks type");
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
            this.logger.log("Triggered by plugin event");
            this.requestUpdate();
        });
        return true;
    }

    private unsubscribe(): void {
        this.dispatcher.removeListener(this.metaRef);
        this.view.plugin.offref(this.ref);
        this.view.plugin.trigger("changed");
    }

    private onChanged(path: string = null): { [k: string]: boolean } {
        const items = this.view.plugin.items;
        const itemDoms = this.view.itemDoms;
        const result: { [k: string]: boolean } = {};
        for (const item of items) {
            const titleEl = itemDoms.get(item)?.titleEl;
            result[item.path] = false;
            if (
                titleEl &&
                item.type === "file" &&
                (item.title === "" || item?.title === undefined) &&
                (!path || item.path === path)
            ) {
                this.process(titleEl, item.path).catch(console.error);
                result[item.path] = true;
            }
        }
        return result;
    }

    private async process(div: Element, path: string): Promise<void> {
        const title = this.resolver.resolve(path) ?? div.getText();
        if (div.getText() !== title) {
            div.setText(title);
        }
    }
}
