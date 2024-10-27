import { BookmarksPluginLeaf, BookmarksPluginView, EventRef } from "obsidian";
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

enum State {
    Disabled = "disabled",
    Enabled = "enabled",
    Awaiting = "awaiting",
}

@injectable()
export default class BookmarksManager extends AbstractFeature<Feature> {
    private state: State = State.Disabled;
    private view: BookmarksPluginView = null;
    private ref: EventRef = null;
    private metaRef: ListenerRef<"metadata:cache:changed"> = null;
    private activeLeafChangeRef: ListenerRef<"active:leaf:change"> = null;
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
        this.resolver = service.createResolver(this.getId());
    }

    private setState(state: State): void {
        this.logger.log(`State changed from ${this.state} to ${state}`);
        this.state = state;
    }
    static getId(): Feature {
        return Feature.Bookmarks;
    }

    enable(): void {
        this.tryEnable(true);
    }

    disable(): void {
        this.logger.log("disable");
        if (this.isEnabled()) {
            this.unsubscribe();
            this.view = null;
            this.setState(State.Disabled);
        }
    }

    getId(): Feature {
        return BookmarksManager.getId();
    }

    isEnabled(): boolean {
        return this.state !== State.Disabled;
    }

    private tryEnable(subscribeOnActive = false): void {
        const leaf = this.facade.getLeavesOfType<BookmarksPluginLeaf>(Leaves.Bookmarks)?.[0];

        if (leaf.isVisible()) {
            if (this.state !== State.Enabled && this.initView() && this.subscribe()) {
                this.setState(State.Enabled);
                this.requestUpdate();
            }
            if (this.activeLeafChangeRef) {
                this.dispatcher.removeListener(this.activeLeafChangeRef);
                this.activeLeafChangeRef = null;
            }
        } else if (subscribeOnActive) {
            this.setState(State.Awaiting);
            this.activeLeafChangeRef = this.dispatcher.addListener({
                name: "active:leaf:change",
                cb: () => this.tryEnable(),
            });
        }
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
        this.metaRef = this.dispatcher.addListener({
            name: "metadata:cache:changed",
            cb: this.requestUpdate.bind(this),
        });
        return true;
    }

    private unsubscribe(): void {
        if (this.metaRef) {
            this.dispatcher.removeListener(this.metaRef);
        }
        if (this.activeLeafChangeRef) {
            this.dispatcher.removeListener(this.activeLeafChangeRef);
        }
        if (this.state === State.Enabled) {
            this.view.plugin.offref(this.ref);
            this.view.plugin.trigger("changed");
        }
    }

    private onChanged(path: string = null): { [k: string]: boolean } {
        if (this.state !== State.Enabled) {
            this.logger.log(`Called onChanged when is ${this.state} state`);
            return;
        }
        if (!this.view.plugin) {
            return;
        }
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
