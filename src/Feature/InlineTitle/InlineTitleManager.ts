import AbstractManager from "@src/Feature/AbstractManager";
import { Feature } from "@src/enum";
import { inject, injectable, named } from "inversify";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import SI from "@config/inversify.types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { CanvasNode, MarkdownViewExt } from "obsidian";
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

        const canvasViews = this.facade.getViewsOfType<MarkdownViewExt>("canvas");
        for (const view of canvasViews) {
            for (const node of view.canvas.nodes.values()) {
                promises.push(this.resolver.resolve(node.filePath).then(r => this.setCanvasTitle(node, r)));
            }
        }

        await Promise.all(promises);
        return promises.length > 0;
    }

    private async setCanvasTitle(node: CanvasNode, title: string | null): Promise<void> {
        while (!node.isContentMounted) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.logger.log(`Set canvas title "${title ?? " "}" for ${node.filePath}`);
        this.addFakeTitleElement(node.labelEl, title);

        const inlineTitleEl = node.contentEl?.querySelector(".inline-title") as HTMLElement;
        this.addFakeTitleElement(inlineTitleEl, title);
    }

    private addFakeTitleElement(originalElement: HTMLElement, title: string): void {
        if (!originalElement) {
            return;
        }

        const container = originalElement.parentElement;
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
            originalElement.hidden = false;
            return;
        }
        if (title && el && el.innerText === title && !el.hidden) {
            this.logger.log("skipped");
            return;
        }
        if (el === null) {
            el = document.createElement("div");
            el.className = originalElement.className;
            el.dataset["ofmt"] = "true";
            el.innerText = title;
            el.hidden = true;
            el.onclick = () => {
                el.hidden = true;
                originalElement.hidden = false;
                originalElement.focus();
                originalElement.onmouseleave = originalElement.onblur = () => {
                    originalElement.hidden = true;
                    el.hidden = false;
                };
            };
            container.insertBefore(el, originalElement);
        }

        el.innerText = title;
        el.hidden = false;
        originalElement.hidden = true;
    }

    private setTitle(view: MarkdownViewExt, title: string | null): void {
        this.logger.log(`Set inline title "${title ?? " "}" for ${view.file.path}`);
        this.addFakeTitleElement(view.inlineTitleEl, title);
    }

    getId(): Feature {
        return InlineTitleManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
