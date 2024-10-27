import { TFile, TFileExplorerItem, TFileExplorerView, WorkspaceLeafExt } from "obsidian";
import { Feature, Leaves, Plugins } from "@src/Enum";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import AbstractManager from "@src/Feature/AbstractManager";
import ExplorerViewUndefined from "@src/Feature/Explorer/ExplorerViewUndefined";
import { ExplorerFileItemMutator } from "./ExplorerFileItemMutator";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";
import { State } from "@src/Feature/Explorer/Types";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

@injectable()
export default class ExplorerManager extends AbstractManager {
    private explorerView: TFileExplorerView = null;
    private modified = new WeakMap<TFileExplorerItem, ExplorerFileItemMutator>();
    private state: State = State.Disabled;
    private sort: ExplorerSort = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["feature:explorer:file_mutator:factory"])
        private factory: (item: TFileExplorerItem, resolver: ResolverInterface) => ExplorerFileItemMutator,
        @inject(SI["factory:feature:explorer:sort"])
        sortFactory: () => ExplorerSort | null,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["logger"])
        @named(Feature.Explorer)
        private logger: LoggerInterface
    ) {
        super();
        this.sort = sortFactory();
    }

    static getId(): Feature {
        return Feature.Explorer;
    }

    private setState(state: State) {
        this.state = state;
    }
    private isState(state: State): boolean {
        return this.state === state;
    }
    getId(): Feature {
        return Feature.Explorer;
    }

    isEnabled(): boolean {
        return this.state !== State.Disabled;
    }

    protected doDisable() {
        if (this.explorerView) {
            this.restoreTitles();
            this.explorerView = null;
        }
        this.sort?.stop();
        this.setState(State.Disabled);
    }

    private tryEnable(): void {
        this.sort?.start();
        this.setState(State.Enabled);
        this.logger.log("Manager enabled");
    }

    private subscribe(): void {
        const ref = this.dispatcher.addListener({
            name: "active:leaf:change",
            cb: () => {
                if (this.isEnabled() && this.getExplorerView()) {
                    this.logger.log("Catch explorer view");
                    this.tryEnable();
                    this.doRefresh().catch(this.logger.log);
                    this.dispatcher.removeListener(ref);
                } else if (!this.isEnabled()) {
                    this.logger.log("Called when is not enabled");
                    this.dispatcher.removeListener(ref);
                }
            },
        });
        this.setState(State.WaitForActiveLeaf);
    }

    protected doEnable() {
        if (!this.facade.isInternalPluginEnabled(Plugins.FileExplorer)) {
            this.logger.info(`internal plugin ${Plugins.FileExplorer} is not enabled`);
            return;
        }
        if (!this.getExplorerView()) {
            this.logger.log("Could not get view. Subscribe and wait for active leaf");
            this.subscribe();
        } else {
            this.tryEnable();
        }
    }

    protected async doRefresh(): Promise<{ [p: string]: boolean }> {
        if (this.isState(State.Enabled)) {
            return this.updateInternal(Object.values(this.getExplorerFileItems()));
        }
        return {};
    }

    protected async doUpdate(path: string): Promise<boolean> {
        if (this.isState(State.Enabled)) {
            const item = this.getExplorerFileItems()[path];
            await this.updateInternal(item ? [item] : []);
            return !!item;
        }
        return false;
    }

    private getExplorerView(): TFileExplorerView | null {
        if (this.explorerView === null) {
            const leaves = this.facade.getLeavesOfType<WorkspaceLeafExt>(Leaves.FE);

            if (leaves.length > 1) {
                throw new Error("There are some explorers' leaves");
            }

            const leaf = leaves?.[0];

            //TODO: what if it be later?
            if (leaf === undefined || leaf === null) {
                throw new ExplorerViewUndefined("Explorer leaf is undefined");
            }
            if (leaf.isVisible()) {
                this.explorerView = leaf.view as TFileExplorerView;
            }
        }
        return this.explorerView;
    }

    private getExplorerFileItems(): { [K: string]: TFileExplorerItem } {
        return this.getExplorerView()?.fileItems ?? {};
    }

    private async updateInternal(items: TFileExplorerItem[]): Promise<{ [k: string]: boolean }> {
        for (const i of items) {
            if (!(i.file instanceof TFile)) {
                continue;
            }
            if (!this.modified.has(i)) {
                this.modified.set(i, this.factory(i, this.resolver));
            }
            i.updateTitle();
        }
        return {};
    }

    private restoreTitles(): void {
        Object.values(this.explorerView.fileItems).map(this.restore.bind(this));
    }

    private restore(item: TFileExplorerItem): boolean {
        if (this.modified.has(item)) {
            this.modified.get(item).destroy();
            item.updateTitle();
            this.modified.delete(item);
            return true;
        }
        return false;
    }
}
