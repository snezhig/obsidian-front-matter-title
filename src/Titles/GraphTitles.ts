import FileTitleResolver from "../FileTitleResolver";
import FunctionReplacer from "../Utils/FunctionReplacer";
import {GraphLeaf, GraphNode, TAbstractFile, Workspace} from "obsidian";
import Queue from "../Utils/Queue";


export default class GraphTitles {
	private replacement: FunctionReplacer<GraphNode, 'getDisplayText'> = null;

	constructor(
		private workspace: Workspace,
		private resolver: FileTitleResolver,
		private queue = new Queue<string>(this.runQueue.bind(this), 200)
	) {
	}

	public replaceNodeTextFunction() {
		if (this.replacement?.isReplaced() === false) {
			return;
		}
		if (this.replacement === null) {
			this.createReplacement();
		}
		if (this.replacement?.isReplaced() === false) {
			this.replace();
		}
	}

	public forceTitleUpdate(file: TAbstractFile = null): void {
		for (const leaf of this.getLeaves()) {
			for (const node of leaf.view?.renderer?.nodes ?? []) {
				if (file && file.path === node.id) {
					this.queue.add(node.id);
					break;
				}
				this.queue.add(node.id);
			}
		}
	}

	public onUnload(): void {
		this.replacement.restore();
	}

	private getLeaves(): GraphLeaf[] {
		return this.workspace.getLeavesOfType('graph') as GraphLeaf[];
	}

	private async runQueue(items: Set<string>) {

		for (const id of items) {
			await this.resolver.resolve(id);
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
			if (ob.resolver.canBeResolved(this.id)) {
				if (ob.resolver.isResolved(this.id)) {
					const title = ob.resolver.getResolved(this.id);
					return title || self.getVanilla().call(this, ...args);
				} else {
					ob.queue.add(this.id);
				}
			}
			return self.getVanilla().call(this, ...args);
		})
	}
}
