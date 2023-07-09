import { inject, injectable } from "inversify";
import EventDispatcherInterface from "../../Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { Feature, Leaves } from "../../Enum";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { AppEvents } from "../../Types";
import AbstractManager from "../AbstractManager";
import SI from "../../../config/inversify.types";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import BacklinkHelper from "../../Utils/BacklinkHelper";
import { MarkdownViewExt } from "obsidian";

@injectable()
export default class BacklinkMarkdownManager extends AbstractManager {
    private enabled = false;
    private ref: ListenerRef<"layout:change"> = null;

    constructor(
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["backlink:helper"])
        private helper: BacklinkHelper
    ) {
        super();
    }

    isEnabled(): boolean {
        console.log(this.enabled)
        return this.enabled;
    }
    protected doEnable(): void {
        this.ref = this.dispatcher.addListener({
            name: "layout:change",
            cb: () => this.refresh().catch(console.error)
        })
        this.enabled = true;
        console.log('----')
    }
    protected doDisable(): void {
        this.dispatcher.removeListener(this.ref);
        this.ref = null;
        this.innerUpdate(null, true);
        this.enabled = false;
    }
    protected doUpdate(path: string): Promise<boolean> {
        return this.innerUpdate(path);
    }

    private async innerUpdate(path: string = null, restore = false): Promise<boolean> {
        const views = this.facade.getViewsOfType<MarkdownViewExt>(Leaves.MD).filter(v => v.backlinks);
        console.log(views);
        for (const view of views) {
            this.helper.processTitles(view.backlinks, this.resolver, path, restore);
        }
        return true;
    }
    protected async doRefresh(): Promise<void> {
        await this.innerUpdate();
    }
    static getId(): Feature {
        return Feature.BacklinkMarkdown;
    }
    getId(): Feature {
        return BacklinkMarkdownManager.getId();
    }
}