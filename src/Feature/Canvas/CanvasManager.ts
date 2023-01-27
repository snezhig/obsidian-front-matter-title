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
import FakeTitleElementService from "@src/Utils/FakeTitleElementService";

@injectable()
export class CanvasManager extends AbstractManager {
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
        @named(`manager:${CanvasManager.getId()}`)
        private logger: LoggerInterface,
        @inject(SI["service:fake_title_element"])
        private fakeTitleElementService: FakeTitleElementService
    ) {
        super();
        fakeTitleElementService.handleHoverEvents = true;
    }

    static getId(): Feature {
        return Feature.Canvas;
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
        const promises = [];

        const canvasViews = this.facade.getViewsOfType<MarkdownViewExt>("canvas");
        for (const view of canvasViews) {
            if (!view.file) {
                continue;
            }
            const currentPath = view.file.path;
            if (!path || currentPath === path) {
                const canvas = view.canvas;
                if (!canvas.requestFrame._originalFunc) {
                    const originalFunc = canvas.requestFrame;
                    const manager = this;
                    canvas.requestFrame = function (...args) {
                        canvas.requestFrame._originalFunc.apply(this, args);
                        manager.innerUpdate(currentPath);
                    };
                    canvas.requestFrame._originalFunc = originalFunc;
                }

                for (const node of canvas.nodes.values()) {
                    promises.push(this.resolver.resolve(node.filePath).then(r => this.setCanvasTitle(node, r)));
                }
            }
        }

        await Promise.all(promises);
        return promises.length > 0;
    }

    private async setCanvasTitle(node: CanvasNode, title: string | null): Promise<void> {
        while (!node.initialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.logger.log(`Set canvas title "${title ?? " "}" for ${node.filePath}`);
        this.fakeTitleElementService.addFakeTitleElement(node.labelEl, title);

        this.fakeTitleElementService.addFakeTitleElement(node.placeholderEl, title);

        const inlineTitleEl = node.contentEl?.querySelector(".inline-title") as HTMLElement;
        this.fakeTitleElementService.addFakeTitleElement(inlineTitleEl, title);
    }

    getId(): Feature {
        return CanvasManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
