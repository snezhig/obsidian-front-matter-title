import SI from "@config/inversify.types";
import Callback from "@src/Components/EventDispatcher/Callback";
import Event from "@src/Components/EventDispatcher/Event";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { Feature } from "@src/enum";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { AppEvents } from "@src/Types";
import { inject, injectable } from "inversify";
import BaseFeature from "@src/Managers/Features/BaseFeature";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";

@injectable()
export default class FileNoteLinkFilterFeature extends BaseFeature implements FeatureInterface<Feature> {
    private enabled = false;
    private cb: CallbackInterface<AppEvents["note:link:filter"]>;
    constructor(
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>
    ) {
        super();
        this.init();
    }

    static id(): Feature {
        return Feature.FileNoteLinkFilter;
    }

    private init(): void {
        this.cb = new Callback<AppEvents["note:link:filter"]>(e => {
            if (!this.isEnabled()) {
                return e;
            }
            return new Event({ links: e.get().links.filter(e => !/^\[\[.*\|+.*]]$/.test(e.original)) });
        });
    }

    async enable(): Promise<void> {
        if (!this.isEnabled()) {
            this.dispatcher.addListener("note:link:filter", this.cb);
            this.enabled = true;
        }
    }
    async disable(): Promise<void> {
        this.dispatcher.removeListener("note:link:filter", this.cb);
        this.enabled = false;
    }
    getId(): Feature {
        return Feature.FileNoteLinkFilter;
    }
    isEnabled(): boolean {
        return this.enabled;
    }
}
