import AbstractManager from "@src/Feature/AbstractManager";
import { Feature, Leaves } from "@src/Enum";
import { inject, injectable, named } from "inversify";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import SI from "@config/inversify.types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { CanvasNode, CanvasViewExt, debounce } from "obsidian";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import FakeTitleElementService from "@src/Utils/FakeTitleElementService";

@injectable()
export class CanvasManager extends AbstractManager {
    private ref: ListenerRef<"layout:change"> = null;
    private enabled = false;
    private queue: Set<string> = new Set();

    constructor(
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.logger)
        @named(`manager:${CanvasManager.getId()}`)
        private logger: LoggerInterface,
        @inject(SI["service:fake_title_element"])
        private fakeTitleElementService: FakeTitleElementService
    ) {
        super();
    }

    static getId(): Feature {
        return Feature.Canvas;
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

    private updateByRequestFrame = debounce(
        () => {
            this.logger.log(`updateByRequestFrame`, this.queue);
            Array.from(this.queue.values()).forEach(e => this.innerUpdate(e) && this.queue.delete(e));
        },
        1000,
        true
    );

    private async resolve(path: string): Promise<string | null> {
        return this.resolver.resolve(path);
    }

    private async innerUpdate(path: string = null): Promise<boolean> {
        const promises = [];
        this.logger.log(`inner update "${path}"`);

        const canvasViews = this.facade.getViewsOfType<CanvasViewExt>(Leaves.LG);
        for (const view of canvasViews) {
            if (!view.file) {
                continue;
            }
            const currentPath = view.file.path;
            const canvas = view.canvas;
            for (const node of canvas.nodes.values()) {
                if (!node.filePath || (path && path !== node.filePath && path !== currentPath)) {
                    continue;
                }
                promises.push(
                    this.resolve(node.filePath).then(title => {
                        if (title) {
                            this.setNodeTitle(node, title);
                        } else {
                            this.restoreNodeTitle(node);
                        }
                    })
                );
            }

            if (!canvas.requestFrame._originalFunc) {
                const originalFunc = canvas.requestFrame;
                const manager = this;
                canvas.requestFrame = function (...args) {
                    canvas.requestFrame._originalFunc.apply(this, args);
                    if (manager.enabled) {
                        manager.queue.add(currentPath);
                        manager.updateByRequestFrame();
                    } else {
                        canvas.requestFrame = canvas.requestFrame._originalFunc;
                    }
                };
                canvas.requestFrame._originalFunc = originalFunc;
            }
        }

        await Promise.all(promises);
        return promises.length > 0;
    }

    private restoreNodeTitle(node: CanvasNode): void {
        const ids = this.makeFakeElementIds(node.canvas.view.file.path, node.filePath);
        this.fakeTitleElementService.remove(ids.label);
        this.fakeTitleElementService.remove(ids.inline);
    }

    private async setNodeTitle(node: CanvasNode, title: string | null): Promise<void> {
        do {
            await new Promise(resolve => setTimeout(resolve, 200));
        } while (!node.initialized);

        const view = node.canvas.view;

        this.logger.log(`Set canvas title "${title}" for canvas "${view.file.path}" and node "${node.filePath}"`);

        const ids = this.makeFakeElementIds(view.file.path, node.filePath);

        const label = this.fakeTitleElementService.getOrCreate({
            original: node.labelEl,
            title,
            id: ids.label,
            events: ["hover"],
        });

        if (label?.created) {
            this.fakeTitleElementService.setVisible(ids.label, true);
        }

        const inlineTitleEl = node.contentEl?.querySelector(".inline-title") as HTMLElement;
        const inline = this.fakeTitleElementService.getOrCreate({
            original: inlineTitleEl,
            title,
            id: ids.inline,
            events: ["click"],
        });
        if (inline?.created) {
            this.fakeTitleElementService.setVisible(ids.inline, true);
        }
    }

    private makeFakeElementIds(canvasPath: string, nodePath: string): { label: string; inline: string } {
        const prefix = `${canvasPath}-${nodePath}`;
        return {
            label: `${prefix}-label`,
            inline: `${prefix}-inline`,
        };
    }

    getId(): Feature {
        return CanvasManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
