import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { SearchPluginView, SearchViewDOM } from "obsidian";
import { Manager } from "@src/enum";
import AbstractManager from "@src/Managers/AbstractManager";
import { inject, injectable, named } from "inversify";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";

type Replacer = FunctionReplacer<SearchViewDOM, "addResult", SearchManager>;

@injectable()
export default class SearchManager extends AbstractManager {
    private enabled = false;
    private replacer: Replacer = null;
    private dom: SearchViewDOM = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface,
        @inject(SI.logger)
        @named("manager:starred")
        private logger: LoggerInterface
    ) {
        super();
    }

    private getView(): SearchPluginView | null {
        return this.facade.getViewsOfType<SearchPluginView>("search")?.[0] ?? null;
    }

    private getSearchDom(): SearchViewDOM | null {
        if (!this.dom) {
            this.dom = this.getView()?.dom ?? null;
        }
        return this.dom;
    }

    private initReplacer(): Replacer | null {
        if (!this.replacer && this.getSearchDom()) {
            this.replacer = FunctionReplacer.create(
                this.getSearchDom(),
                "addResult",
                this,
                function (self, defaultArgs, vanilla) {
                    const c = vanilla.call(this, ...defaultArgs);
                    const file = defaultArgs[0];
                    if (file?.extension === "md") {
                        const title = self.resolver.resolve(file.path);
                        if (title) {
                            c.containerEl.find(".tree-item-inner").setText(title);
                        }
                    }
                    return c;
                }
            );
        }
        return this.replacer;
    }

    protected async doDisable(): Promise<void> {
        this.initReplacer().disable();
        this.enabled = false;
        this.getView()?.startSearch();
    }

    protected async doEnable(): Promise<void> {
        this.initReplacer()?.enable();
        this.enabled = !!this.replacer;
        if (this.enabled) {
            this.getView().startSearch();
        }
    }

    getId(): Manager {
        return Manager.Search;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    protected async doUpdate(path?: string | null): Promise<boolean> {
        let run = !(path ?? false);
        if (path) {
            for (const file of this.getSearchDom().resultDomLookup.keys()) {
                if (file.path === path) {
                    run = true;
                    break;
                }
            }
        }
        if (run) {
            this.getView().startSearch();
        }
        return run;
    }
}
