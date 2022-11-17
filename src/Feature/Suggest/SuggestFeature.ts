import { Feature } from "@src/enum";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { Chooser, SuggestModalChooserFileItem } from "obsidian";
import AbstractFeature from "../AbstractFeature";
import { inject, injectable, interfaces, named } from "inversify";
import SI from "@config/inversify.types";
import Newable = interfaces.Newable;

@injectable()
export default class SuggestFeature extends AbstractFeature<Feature> {
    private replacer: FunctionReplacer<Chooser, "setSuggestions", SuggestFeature> = null;
    private state: boolean;

    constructor(
        @inject(SI.resolver)
        @named(Resolving.Sync)
        private resolver: ResolverInterface,
        @inject(SI["newable:obsidian:chooser"])
        chooser: Newable<Chooser>
    ) {
        super();
        this.createChooserReplacer(chooser);
    }

    isEnabled(): boolean {
        return this.state;
    }

    public enable(): void {
        if (this.isEnabled()) {
            return;
        }
        this.replacer.enable();
        this.state = true;
    }

    public disable(): void {
        this.replacer.disable();
        this.state = false;
    }

    getId(): Feature {
        return SuggestFeature.getId();
    }

    static getId(): Feature {
        return Feature.Suggest;
    }

    private createChooserReplacer(chooser: Newable<Chooser>): void {
        if (typeof chooser.prototype.setSuggestions !== "function") {
            return;
        }
        this.replacer = new FunctionReplacer(chooser.prototype, "setSuggestions", this, function (
            self: SuggestFeature,
            args: unknown[],
            vanilla: (e: any) => any
        ) {
            if (Array.isArray(args?.[0])) {
                args[0] = self.modifySuggestions(args[0]);
            }
            return vanilla.call(this, ...args);
        });
        this.replacer.enable();
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
