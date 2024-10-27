import AbstractManager from "@src/Feature/AbstractManager";
import { Feature, Leaves } from "@src/Enum";
import { inject, injectable, named } from "inversify";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import SI from "@config/inversify.types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import FakeTitleElementService from "@src/Utils/FakeTitleElementService";
import { MarkdownViewExt } from "obsidian";

@injectable()
export class InlineTitleManager extends AbstractManager {
    private ref: ListenerRef<"layout:change"> = null;
    private enabled = false;

    constructor(
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.logger)
        @named(`manager:${InlineTitleManager.getId()}`)
        private logger: LoggerInterface,
        @inject(SI["service:fake_title_element"])
        private fakeTitleElementService: FakeTitleElementService
    ) {
        super();
    }

    static getId(): Feature {
        return Feature.InlineTitle;
    }

    getId(): Feature {
        return InlineTitleManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    protected doDisable(): void {
        this.dispatcher.removeListener(this.ref);
        this.fakeTitleElementService.removeAll();
        this.enabled = false;
    }

    protected doEnable(): void {
        this.ref = this.dispatcher.addListener({
            name: "layout:change",
            cb: () => this.refresh().catch(console.error),
        });
        this.enabled = true;
    }

    protected async doRefresh(): Promise<{ [p: string]: boolean }> {
        await this.innerUpdate();
        return Promise.resolve({});
    }

    protected async doUpdate(path: string): Promise<boolean> {
        return this.innerUpdate(path);
    }

    private async resolve(path: string): Promise<string | null> {
        return this.resolver.resolve(path);
    }

    private async innerUpdate(path: string = null): Promise<boolean> {
        const views = this.facade.getViewsOfType<MarkdownViewExt>(Leaves.MD);
        const promises = [];
        const ids: string[] = [];
        for (const view of views) {
            if (view.file && (!path || view.file.path === path)) {
                promises.push(
                    this.resolve(view.file.path)
                        .then(title =>
                            title ? ids.push(this.setTitle(view, title)) : this.resetTitle(this.getTitleElId(view))
                        )
                        .catch(console.error)
                );
            }
        }

        await Promise.all(promises);
        this.fakeTitleElementService.removeExcept(ids);
        return promises.length > 0;
    }

    private resetTitle(id: string): void {
        this.fakeTitleElementService.remove(id);
    }

    private setTitle(view: MarkdownViewExt, title: string | null): string {
        this.logger.log(`Set inline title "${title ?? " "}" for ${view.file.path}`);
        const id = this.getTitleElId(view);
        const original = view.inlineTitleEl;
        const { created } = this.fakeTitleElementService.getOrCreate({ original, title, id, events: ["click"] });
        if (created && !original.isActiveElement()) {
            this.fakeTitleElementService.setVisible(id, true);
        }
        return id;
    }

    private getTitleElId(view: MarkdownViewExt): string {
        return `${view.getState().mode}-${this.getId()}-${view.leaf.id}`;
    }
}
