import FileTitleResolver from "./FileTitleResolver";
import FunctionReplacer from "./FunctionReplacer";
import {Workspace, GraphLeaf, GraphNode} from "obsidian";
import {debounce} from "ts-debounce";


export default class GraphObserver {
	private replacement: FunctionReplacer<GraphNode, 'getDisplayText'> = null;
	private queue = new Set;

	constructor(
		private workspace: Workspace,
		private resolver: FileTitleResolver
	) {
	}

	private runQueue = debounce(async () => {

		for (const id of this.queue) {
			await this.resolver.resolveTitleByPath(id);
		}

		const leaves = this.workspace.getLeavesOfType('graph') as GraphLeaf[];
		for (const leaf of leaves) {
			const nodes = leaf?.view?.renderer?.nodes ?? [];
			for (const node of nodes) {
				if (this.queue.has(node.id)) {
					leaf.view?.renderer?.onIframeLoad();
					break;
				}
			}
		}
		this.queue.clear();
	}, 200);

	private async resolveNodeTitle(id: string): Promise<void> {
		this.queue.add(id);
		console.log(id);
		await this.runQueue();

	}

	//TODO: split to functions
	public onLayoutChange() {
		if (this.replacement?.isReplaced()) {
			return;
		}

		if (this.replacement === null) {
			for (const leaf of (this.workspace.getLeavesOfType('graph') as GraphLeaf[])) {
				const nodes = leaf?.view?.renderer?.nodes ?? [];
				for (const node of nodes) {
					this.replacement = new FunctionReplacer(Object.getPrototypeOf(node), 'getDisplayText');
				}
			}
		}

		if (this.replacement) {

			const ob = this;
			this.replacement.replace(function (self, args) {
				if (ob.resolver.isResolved(this.id)) {
					const title = ob.resolver.getResolved(this.id);

					return title || self.getVanilla().call(this, ...args);
				} else {
					ob.resolveNodeTitle.call(ob, this.id);
				}
				return self.getVanilla().call(this, ...args);
			})
		}
	}
}
