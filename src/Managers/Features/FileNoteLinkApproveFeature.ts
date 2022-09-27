import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import Callback from "@src/Components/EventDispatcher/Callback";
import Event from "@src/Components/EventDispatcher/Event";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { Feature } from "@src/enum";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { AppEvents } from "@src/Types";
import ChangeApproveModal from "@src/UI/ChangeApproveModal";
import { inject, injectable, named } from "inversify";
import BaseFeature from "@src/Managers/Features/BaseFeature";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";

@injectable()
export default class LinkNoteApproveFeature extends BaseFeature implements FeatureInterface<Feature> {
    private cb: CallbackInterface<AppEvents["note:link:change:approve"]>;
    private enabled = false;
    constructor(
        @inject(SI.logger)
        @named("link:note:approve")
        private logger: LoggerInterface,
        @inject(SI.dispatcher)
        private dispatcher: DispatcherInterface<AppEvents>,
        @inject(SI["modal:change:approve"])
        private modal: ChangeApproveModal
    ) {
        super();
        this.init();
    }
    async enable(): Promise<void> {
        if (!this.isEnabled()) {
            this.dispatcher.addListener("note:link:change:approve", this.cb);
            this.enabled = true;
        }
    }
    async disable(): Promise<void> {
        this.dispatcher.removeListener("note:link:change:approve", this.cb);
        this.enabled = false;
    }

    static id(): Feature {
        return Feature.FileNoteLinkApproval;
    }
    getId(): Feature {
        return LinkNoteApproveFeature.id();
    }

    isEnabled(): boolean {
        return this.enabled;
    }
    private init(): void {
        this.cb = new Callback<AppEvents["note:link:change:approve"]>(e => {
            if (!this.isEnabled()) {
                return e;
            }
            const { path, changes } = e.get();
            const approve = new Promise<boolean>(r => this.modal.create(path, changes, r).open());
            return new Event({ path, changes, approve });
        });
    }
}
