import { Feature } from "@src/enum";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { SuggestModal, SuggestModalChooser, SuggestModalChooserFileItem, SuggestModalExt } from "obsidian";
import AbstractFeature from "../AbstractFeature";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";

type Replacers = {
    modal?: FunctionReplacer<SuggestModalExt<any>, "open", SuggestFeature>;
    chooser?: FunctionReplacer<SuggestModalChooser<any>, "setSuggestions", SuggestFeature>;
};

@injectable()
export default class SuggestFeature extends AbstractFeature<Feature> {
    private repalcers: Replacers = {};
    private state: boolean;

    constructor(
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface
    ) {
        super();
        this.createModalReplacer();
    }

    isEnabled(): boolean {
        return this.state;
    }
    public enable(): void {
        if (this.isEnabled()) {
            return;
        }
        if (!this.repalcers?.chooser?.enable()) {
            this.repalcers.modal.enable();
        }
        this.state = true;
    }
    public disable(): void {
        this.repalcers.modal.disable();
        this.repalcers?.chooser?.disable();
        this.state = false;
    }

    getId(): Feature {
        return SuggestFeature.getId();
    }

    static getId(): Feature {
        return Feature.Suggest;
    }

    private createModalReplacer(): void {
        this.repalcers.modal = new FunctionReplacer(SuggestModal.prototype, "open", this, function (
            self: SuggestFeature,
            args: unknown[],
            vanilla: () => any
        ) {
            self.createChooserReplacer.call(self, this);
            return vanilla.call(this, ...args);
        });
    }
    private createChooserReplacer(modal: SuggestModalExt<any>): void {
        if (this.repalcers.chooser) {
            return;
        }
        if (typeof modal?.chooser?.setSuggestions !== "function") {
            return;
        }
        this.repalcers.chooser = new FunctionReplacer(modal.chooser.__proto__, "setSuggestions", this, function (
            self: SuggestFeature,
            args: unknown[],
            vanilla: (e: any) => any
        ) {
            self.repalcers.modal.disable();
            if (Array.isArray(args?.[0])) {
                args[0] = self.modifySuggestions(args[0]);
            }
            return vanilla.call(this, ...args);
        });
        this.repalcers.chooser.enable();
        this.repalcers.modal.disable();
    }
    private modifySuggestions(items: SuggestModalChooserFileItem[]): SuggestModalChooserFileItem[] {
        for (const item of items) {
            if (!item || !item.type || item.type !== "file" || !item.file) {
                continue;
            }
            const alias = this.resolver.resolve(item.file.path);
            if (alias) {
                item.alias = alias;
                item.type = "alias";
            }
        }
        return items;
    }
}
