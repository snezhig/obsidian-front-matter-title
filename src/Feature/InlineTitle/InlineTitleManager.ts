import AbstractManager from "@src/Feature/AbstractManager";
import { Feature } from "@src/enum";
import { inject, injectable, named } from "inversify";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import SI from "@config/inversify.types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
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
        @inject(SI.resolver)
        @named(Resolving.Async)
        private resolver: ResolverInterface<Resolving.Async>,
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

    protected doDisable(): void {
        this.dispatcher.removeListener(this.ref);
        this.fakeTitleElementService.removeFakeTitleElements();
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

    private async innerUpdate(path: string = null): Promise<boolean> {
        const views = this.facade.getViewsOfType<MarkdownViewExt>("markdown");
        const promises = [];
        for (const view of views) {
            if (!path || view.file.path === path) {
                promises.push(this.resolver.resolve(view.file.path).then(r => this.setTitle(view, r)));
            }
        }

        await Promise.all(promises);
        return promises.length > 0;
    }

    private setTitle(view: MarkdownViewExt, title: string | null): void {
        this.logger.log(`Set inline title "${title ?? " "}" for ${view.file.path}`);
        this.fakeTitleElementService.addFakeTitleElement(view.inlineTitleEl, title);
    }

    getId(): Feature {
        return InlineTitleManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
