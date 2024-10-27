import { Feature } from "@src/Enum";
import AbstractFeature from "@src/Feature/AbstractFeature";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { EditableFileView } from "obsidian";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import FeatureService from "@src/Feature/FeatureService";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";

@injectable()
export default class WindowFrameFeature implements AbstractFeature<Feature> {
    private vanillaUpdateTitle: () => void = null;

    private resolver: ResolverInterface;

    private enabled = false;

    private ref: ListenerRef<"metadata:cache:changed"> = null;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["feature:service"])
        featureService: FeatureService,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>
    ) {
        this.resolver = featureService.createResolver(this.getId());
        this.ref = dispatcher.addListener({ name: "metadata:cache:changed", cb: this.onCacheChanged.bind(this) });
    }

    static getId(): Feature {
        return Feature.WindowFrame;
    }

    onCacheChanged(e: EventInterface<AppEvents["metadata:cache:changed"]>) {
        if (this.facade.getActiveFile()?.path === e.get().path) {
            this.updateTitle();
        }
    }

    updateTitle() {
        const e = this.facade.getMostRecentLeaf(this.facade.getActiveLeaf().getContainer());
        let text: string;
        if (e.view instanceof EditableFileView && e.getViewState().state.file) {
            text = this.resolver.resolve(e.getViewState().state.file as string);
        } else {
            text = e?.getDisplayText().trim() ?? "";
        }

        document.title = this.facade.getAppTitle(text);
    }

    disable(): void {
        this.dispatcher.removeListener(this.ref);
        this.facade.getWorkspace().updateTitle = this.vanillaUpdateTitle;
        this.facade.getWorkspace().updateTitle();
        this.enabled = false;
    }

    enable(): void {
        this.vanillaUpdateTitle = this.facade.getWorkspace().updateTitle;
        this.facade.getWorkspace().updateTitle = this.updateTitle.bind(this);
        this.facade.getWorkspace().updateTitle();
        this.enabled = true;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    getId(): Feature {
        return Feature.WindowFrame;
    }
}
