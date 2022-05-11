import FileTitleResolver from "../FileTitleResolver";
import FunctionReplacer from "../Utils/FunctionReplacer";
import {GraphLeaf, GraphNode, TAbstractFile, Workspace} from "obsidian";
import Queue from "../Utils/Queue";
import TitlesManager from "./TitlesManager";
import {string} from "yaml/dist/schema/common/string";

export default class GraphTitles implements TitlesManager {
    private replacement: FunctionReplacer<GraphNode, 'getDisplayText', GraphTitles> = null;
    private queue: Queue<string, void>;
    private enabled = false;
    private lastTitles = new Map<string, string>();

    constructor(
        private workspace: Workspace,
        private resolver: FileTitleResolver,
    ) {
        this.queue = new Queue<string, void>(this.runQueue.bind(this), 200)
    }

    private getTitle(id: string): string | null | false {
        //TODO: what if it can be resolved, but is not resolved again and again?
        return this.resolver.isResolved(id) ? this.resolver.getResolved(id) : false;
    }

    private static getReplaceFunction() {
        return function (self: GraphTitles, defaultArgs: unknown[], vanilla: Function) {
            if (self.resolver.canBeResolved(this.id)) {
                const title = self.getTitle(this.id);
                if (title) {
                    self.lastTitles.set(this.id, title);
                    return title;
                } else if (title === false) {
                    self.queue.add(this.id).catch(console.error);
                } else {
                    self.lastTitles.delete(this.id);
                }
            }
            return vanilla.call(this, ...defaultArgs);
        };
    }

    disable(): void {
        this.replacement.disable();
        this.update().catch(console.error);
        this.enabled = false;
    }

    enable(): void {
        if (this.replacement === null) {
            const node = this.getFirstGraphNode();
            if (node) {
                this.replacement = this.createReplacement(node);
                this.replacement.enable();
                this.enabled = true;
                return;
            }
        } else {
            this.enabled = true;
        }
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    async update(abstract: TAbstractFile | null = null): Promise<boolean> {
        if (!this.enabled) {
            return false;
        }

        for (const leaf of this.getLeaves()) {
            for (const node of leaf.view?.renderer?.nodes ?? []) {
                if (abstract && abstract.path === node.id) {
                    this.queue.add(node.id).catch(console.error);
                    break;
                } else if (abstract === null) {
                    this.queue.add(node.id).catch(console.error);
                }
            }
        }

        return true;
    }

    private getFirstGraphNode(): GraphNode | null {
        for (const leaf of (this.workspace.getLeavesOfType('graph') as GraphLeaf[])) {
            const node = (leaf?.view?.renderer?.nodes ?? [])?.first() ?? null;
            if (node) {
                return node;
            }
        }
        return null;
    }

    private getLeaves(): GraphLeaf[] {
        return this.workspace.getLeavesOfType('graph') as GraphLeaf[];
    }

    private async resolveTitles(items: Iterable<string>): Promise<[string, string | null][]> {
        const promises = [];

        for (const id of items) {
            promises.push(this.resolver.resolve(id).then(e => [id, e]));
        }

        return await Promise.all(promises) as unknown as Promise<[string, string | null][]>;
    }

    private async runQueue(items: Set<string>) {
        let hasDiff = false;

        for (const [id, title] of await this.resolveTitles(items)) {
            if (this.lastTitles.has(id)) {
                hasDiff = this.lastTitles.get(id) !== title;
            } else {
                hasDiff = title !== null;
            }
        }

        if (hasDiff == false) {
            items.clear();
            return;
        }


        for (const leaf of this.getLeaves()) {
            const nodes = leaf?.view?.renderer?.nodes ?? [];
            for (const node of nodes) {
                if (items.has(node.id)) {
                    leaf.view?.renderer?.onIframeLoad();
                    break;
                }
            }
        }

        items.clear();
    }

    private createReplacement(node: GraphNode): FunctionReplacer<GraphNode, 'getDisplayText', GraphTitles> {
        return new FunctionReplacer(
            Object.getPrototypeOf(node),
            'getDisplayText',
            this,
            GraphTitles.getReplaceFunction()
        );
    }
}
