import AbstractManager from "@src/Feature/AbstractManager";
import { Feature } from "@src/enum";
import { inject, injectable, named } from "inversify";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import SI from "@config/inversify.types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { MarkdownViewExt } from "obsidian";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

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
        private logger: LoggerInterface
    ) {
        super();
    }

    static getId(): Feature {
        return Feature.InlineTitle;
    }

    protected doDisable(): void {
        this.dispatcher.removeListener(this.ref);
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
        const container = view.inlineTitleEl.parentElement;
        let el: HTMLDivElement = null;
        for (const i of Array.from(container.children)) {
            if (i.hasAttribute("data-ofmt") && i instanceof HTMLDivElement) {
                el = i;
                break;
            }
        }
        if (!title) {
            if (el) {
                container.removeChild(el);
            }
            view.inlineTitleEl.hidden = false;
            return;
        }
        if (title && el && el.innerText === title && !el.hidden) {
            this.logger.log(`Set inline title for ${view.file.path} is skipped`);
            return;
        }
        if (el === null) {
            el = document.createElement("div");
            el.className = "inline-title";
            el.dataset["ofmt"] = "true";
            el.innerText = title;
            el.hidden = true;
            el.onclick = () => {
                el.hidden = true;
                view.inlineTitleEl.hidden = false;
                view.inlineTitleEl.focus();
                view.inlineTitleEl.onblur = () => {
                    view.inlineTitleEl.hidden = true;
                    el.hidden = false;
                };
            };
            container.insertBefore(el, view.inlineTitleEl);
        }

        el.innerText = title;
        el.hidden = false;
        view.inlineTitleEl.hidden = true;
        return;
    }

    getId(): Feature {
        return InlineTitleManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
