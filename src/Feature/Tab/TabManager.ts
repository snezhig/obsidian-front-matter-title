import AbstractManager from "@src/Feature/AbstractManager";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import { Feature } from "@src/enum";
import { MarkdownLeaf } from "obsidian";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import { ObsidianActiveFile } from "@config/inversify.factory.types";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";

@injectable()
export default class TabManager extends AbstractManager {
    private enabled = false;
    private readonly callback: CallbackInterface<AppEvents["layout:change"]> = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface,
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>,
        @inject(SI["factory:obsidian:active:file"])
        factory: ObsidianActiveFile
    ) {
        super();
        this.callback = new CallbackVoid(() => {
            const file = factory();
            file && this.update(file.path);
        });
    }

    protected async doDisable(): Promise<void> {
        this.dispatcher.removeListener("layout:change", this.callback);
        this.reset();
        this.enabled = false;
    }

    protected async doEnable(): Promise<void> {
        this.enabled = true;
        this.dispatcher.addListener("layout:change", this.callback);
        return;
    }
    private reset() {
        const leaves = this.facade.getLeavesOfType<MarkdownLeaf>("markdown");
        for (const leaf of leaves) {
            const file = leaf.view?.file;
            if (file) {
                leaf.tabHeaderInnerTitleEl.setText(file.basename);
            }
        }
    }

    private async innerUpdate(path: string = null): Promise<{ [k: string]: boolean }> {
        const leaves = this.facade.getLeavesOfType<MarkdownLeaf>("markdown");
        const result: { [k: string]: boolean } = {};
        for (const leaf of leaves) {
            const file = leaf.view?.file;
            if (path && path !== file.path) {
                continue;
            }
            result[file.path] = false;
            const title = file ? this.resolver.resolve(file.path) : null;
            if (title && title !== leaf.tabHeaderInnerTitleEl.getText()) {
                leaf.tabHeaderInnerTitleEl.setText(title);
                result[file.path] = true;
            }
        }
        return result;
    }

    protected async doRefresh(): Promise<{ [k: string]: boolean }> {
        return this.innerUpdate();
    }

    protected async doUpdate(path: string): Promise<boolean> {
        const result = await this.innerUpdate(path);
        return result[path] === true;
    }

    static getId(): Feature {
        return Feature.Tab;
    }
    getId(): Feature {
        return TabManager.getId();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
