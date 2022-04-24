import FileTitleResolver from "./FileTitleResolver";
import FunctionReplacer from "./Utils/FunctionReplacer";
import {Workspace, GraphLeaf, GraphNode} from "obsidian";
import Queue from "./Utils/Queue";


export default class GraphObserver {
	private replacement: FunctionReplacer<GraphNode, 'getDisplayText'> = null;

	constructor(
		private workspace: Workspace,
		private resolver: FileTitleResolver,
		private queue = new Queue<string>(this.runQueue, 0)
	) {
	}

	private async runQueue(items: Set<string>) {

		for (const id of this.queue) {
			await this.resolver.resolve(id);
		}

		const leaves = this.workspace.getLeavesOfType('graph') as GraphLeaf[];

		for (const leaf of leaves) {
			const nodes = leaf?.view?.renderer?.nodes ?? [];
			for (const node of nodes) {
				if (items.has(node.id)) {
					leaf.view?.renderer?.onIframeLoad();
					break;
				}
			}
		}

		items.clear();
	};

	private createReplacement(): void {
		for (const leaf of (this.workspace.getLeavesOfType('graph') as GraphLeaf[])) {
			const nodes = leaf?.view?.renderer?.nodes ?? [];
			for (const node of nodes) {
				this.replacement = new FunctionReplacer(Object.getPrototypeOf(node), 'getDisplayText');
			}
		}
	}

	private replace(): void {
		const ob = this;
		this.replacement.replace(function (self, args) {
			if (ob.resolver.isResolved(this.id)) {
				const title = ob.resolver.getResolved(this.id);

				return title || self.getVanilla().call(this, ...args);
			} else {
				ob.queue.add(this.id);
			}
			return self.getVanilla().call(this, ...args);
		})
	}

	public handleLayoutChange() {
		if (this.replacement?.isReplaced()) {
			return;
		}

		if (this.replacement === null) {
			this.createReplacement();
		}

		if (this.replacement) {
			this.replace();
		}
	}

	public onUnload(): void {
		this.replacement.restore();
	}
}
