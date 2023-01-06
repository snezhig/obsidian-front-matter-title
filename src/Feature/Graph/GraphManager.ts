import AbstractManager from "@src/Feature/AbstractManager";
import { Feature } from "@src/enum";
import { inject, injectable, named } from "inversify";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import SI from "@config/inversify.types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { GraphNode, GraphView } from "obsidian";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { FunctionReplacerFactory } from "@config/inversify.factory.types";

@injectable()
export default class GraphManager extends AbstractManager {
    private enabled = false;
    private ref: ListenerRef<"layout:change"> = null;
    private replacement: FunctionReplacer<GraphNode, "getDisplayText", GraphManager> = null;

    constructor(
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface<Resolving.Sync>,
        @inject(SI["factory:replacer"])
        private factory: FunctionReplacerFactory<GraphNode, "getDisplayText", GraphManager>,
        @inject(SI.logger)
        @named("manager:graph")
        private logger: LoggerInterface
    ) {
        super();
    }

    static getId(): Feature {
        return Feature.Graph;
    }

    private unbind(): void {
        if (this.ref) {
            this.logger.log("unbind");
            this.dispatcher.removeListener(this.ref);
            this.ref = null;
        }
    }

    private bind(): void {
        this.logger.log("bind");
        this.ref = this.dispatcher.addListener({
            name: "layout:change",
            cb: () => {
                this.initReplacement() && this.unbind();
            },
        });
    }

    private initReplacement(): boolean {
        const node = this.getFirstNode();
        if (node) {
            this.replacement = this.factory(
                Object.getPrototypeOf(node),
                "getDisplayText",
                this,
                function (self, defaultArgs, vanilla) {
                    const text = self.resolver.resolve(this.id);
                    return text ?? vanilla.call(this, ...defaultArgs);
                }
            );
            this.replacement.enable();
            this.refresh().catch(console.error);
            return true;
        } else if (this.getViews().length) {
            this.runBackgroundInit();
            return true;
        }
        return false;
    }

    private runBackgroundInit(): void {
        setTimeout(async () => {
            this.logger.log("init by backgroundInit");
            this.initReplacement();
        }, 200);
    }

    private getFirstNode(): GraphNode | null {
        for (const view of this.getViews()) {
            const node = (view.renderer?.nodes ?? []).first() ?? null;
            if (node) {
                return node;
            }
        }
        return null;
    }

    private getViews(): GraphView[] {
        return [...this.facade.getViewsOfType("graph"), ...this.facade.getViewsOfType("localgraph")];
    }

    protected doDisable(): void {
        this.unbind();
        this.replacement?.disable();
        this.enabled = false;
    }

    protected doEnable(): void {
        if (!this.initReplacement()) {
            this.bind();
        }
        this.enabled = true;
    }

    protected doRefresh(): Promise<{ [p: string]: boolean }> {
        for (const view of this.getViews()) {
            view.renderer?.onIframeLoad();
        }
        return Promise.resolve({});
    }

    protected async doUpdate(path: string): Promise<boolean> {
        let result = false;
        for (const view of this.getViews()) {
            for (const node of view.renderer?.nodes ?? []) {
                if (node.id === path) {
                    result = true;
                    view.renderer.onIframeLoad();
                    break;
                }
            }
        }
        return result;
    }

    getId(): Feature {
        return GraphManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
