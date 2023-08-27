import { Feature } from "@src/Enum";
import FunctionReplacer from "@src/Utils/FunctionReplacer";
import { Chooser, SuggestModalChooserFileItem } from "obsidian";
import AbstractFeature from "../AbstractFeature";
import { inject, injectable, interfaces } from "inversify";
import SI from "@config/inversify.types";
import Newable = interfaces.Newable;
import FeatureService from "@src/Feature/FeatureService";
import { ResolverInterface } from "@src/Resolver/Interfaces";

@injectable()
export default class SuggestFeature extends AbstractFeature<Feature> {
    private replacer: FunctionReplacer<Chooser, "setSuggestions", SuggestFeature> = null;
    private state: boolean;
    private resolver: ResolverInterface;

    constructor(
        @inject(SI["newable:obsidian:chooser"])
        chooser: Newable<Chooser>,
        @inject(SI["feature:service"])
        service: FeatureService
    ) {
        super();
        this.resolver = service.createResolver(this.getId());
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
        const aliases: Set<string> = new Set();
        for (const item of items) {
            if (!item?.file) {
                continue;
            }
            aliases.add(item.alias + item.file.path);
            if (!item || !item.type || item.type !== "file") {
                continue;
            }
            const alias = this.resolver.resolve(item.file.path);
            const value = alias + item.file.path;
            if (alias && !aliases.has(value)) {
                item.alias = alias;
                item.type = "alias";
                aliases.add(value);
            }
        }
        return items;
    }
}
