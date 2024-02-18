import { Feature } from "@src/Enum";
import AbstractFeature from "@src/Feature/AbstractFeature";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { EditableFileView } from "obsidian";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import FeatureService from "@src/Feature/FeatureService";

@injectable()
export default class WindowFrameFeature implements AbstractFeature<Feature> {
    private vanillaUpdateTitle: () => void = null;

    private resolver: ResolverInterface;

    private enabled = false;

    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade,
        @inject(SI["feature:service"])
        featureService: FeatureService
    ) {
        this.resolver = featureService.createResolver(this.getId());
    }

    static getId(): Feature {
        return Feature.WindowFrame;
    }

    updateTitle() {
        const e = this.facade.getMostRecentLeaf(this.facade.getActiveLeaf().getContainer());
        let text = "";
        if (e.view instanceof EditableFileView) {
            text = this.resolver.resolve(e.view.file.path);
        } else {
            text = e?.getDisplayText().trim() ?? "";
        }

        document.title = this.facade.getAppTitle(text);
    }

    disable(): void {
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
