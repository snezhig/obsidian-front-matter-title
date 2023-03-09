import { inject, injectable, named } from "inversify";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { Feature } from "../../enum";
import AbstractManager from "../AbstractManager";
import SI from "../../../config/inversify.types";
import LoggerInterface from "../../Components/Debug/LoggerInterface";
import { BacklinkViewExt } from "obsidian";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import { EventDispatcher } from "../../Components/EventDispatcher/EventDispatcher";
import { AppEvents } from "../../Types";

@injectable()
export default class BacklingManager extends AbstractManager {
    private enabled = false;
    private ref: ListenerRef<"active:leaf:change"> = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI.logger)
        @named("backlink")
        private logger: LoggerInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcher<AppEvents>
    ) {
        super();
    }
    isEnabled(): boolean {
        return this.enabled;
    }
    protected doEnable(): void {
        this.enabled = this.facade.isInternalPluginEnabled(this.getId());
        this.logger.log(`Manager state is ${this.enabled}`);
        if (this.enabled) {
            this.ref = this.dispatcher.addListener({
                name: "active:leaf:change",
                cb: () => setTimeout(() => this.refresh().catch(console.error), 20),
            });
        }
    }
    protected doDisable(): void {
        this.enabled = false;
        if (this.ref) {
            this.dispatcher.removeListener(this.ref);
            this.ref = null;
        }
    }
    private process(path: string = null): void {
        const view = this.facade.getViewsOfType<BacklinkViewExt>(this.getId())[0] ?? null;
        const lookup = view?.backlink?.backlinkDom?.resultDomLookup ?? new Map();

        for (const [file, item] of lookup.entries()) {
            const node = item.containerEl.firstElementChild;
            const text = this.resolver.resolve(file.path) ?? file.basename;
            if (node.getText() !== text) {
                item.containerEl.firstElementChild.setText(text);
            }
        }
    }
    protected async doUpdate(path: string): Promise<boolean> {
        this.process(path);
        return true;
    }
    protected async doRefresh(): Promise<{ [k: string]: boolean }> {
        console.log("refresh");
        this.process();
        return {};
    }
    getId(): Feature {
        return BacklingManager.getId();
    }
    static getId() {
        return Feature.Backlink;
    }
}
