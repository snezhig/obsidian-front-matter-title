// Example
import {
    SuggestModal,
    SuggestModalChooser,
    SuggestModalChooserFileItem,
    SuggestModalExt,
    TAbstractFile,
} from "obsidian";
import FunctionReplacer from "../../Utils/FunctionReplacer";
import Manager from "./Manager";
import ResolverInterface from "../../Interfaces/ResolverInterface";

type Replacers = {
    modal?: FunctionReplacer<SuggestModalExt<any>, "open", QuickSwitcher>;
    chooser?: FunctionReplacer<SuggestModalChooser<any>, "setSuggestions", QuickSwitcher>;
};

export default class QuickSwitcher implements Manager {
    private replacers: Replacers = {};

    private state: boolean;

    constructor(private resolver: ResolverInterface) {
        this.createModalReplacer();
    }

    private static get openCallback() {
        return function (self: QuickSwitcher, defaultArgs: unknown[], vanilla: () => any) {
            self.createChooserReplacer.call(self, this);
            return vanilla.call(this, ...defaultArgs);
        };
    }

    private static get setSuggestionsCallback() {
        return function (self: QuickSwitcher, defaultArgs: unknown[], vanilla: (e: any) => any) {
            self.replacers.modal.disable();

            if (Array.isArray(defaultArgs?.[0])) {
                defaultArgs[0] = self.replaceAliases(defaultArgs[0] as SuggestModalChooserFileItem[]);
            }
            return vanilla.call(this, ...defaultArgs);
        };
    }

    public disable(): Promise<void> | void {
        this.replacers.modal.disable();
        this.replacers?.chooser?.disable();
        this.state = false;
        return;
    }

    public enable(): Promise<void> | void {
        if (!this.replacers?.chooser?.enable()) {
            this.replacers.modal.enable();
        }

        this.state = true;
        return;
    }

    public isEnabled(): boolean {
        return this.state;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public update(abstract?: TAbstractFile | null): Promise<boolean> {
        return Promise.resolve(true);
    }

    private createModalReplacer() {
        this.replacers.modal = new FunctionReplacer<SuggestModalExt<any>, "open", QuickSwitcher>(
            SuggestModal.prototype,
            "open",
            this,
            QuickSwitcher.openCallback
        );
    }

    private createChooserReplacer(modal: SuggestModalExt<any>): void {
        if (this.replacers.chooser) {
            return;
        }
        if (typeof modal?.chooser?.setSuggestions !== "function") {
            return;
        }
        this.replacers.chooser = new FunctionReplacer<SuggestModalChooser<any>, "setSuggestions", QuickSwitcher>(
            modal.chooser.__proto__,
            "setSuggestions",
            this,
            QuickSwitcher.setSuggestionsCallback
        );
        this.replacers.chooser.enable();
        this.replacers.modal.disable();
    }

    private replaceAliases(items: SuggestModalChooserFileItem[]): SuggestModalChooserFileItem[] {
        for (const item of items) {
            if (!item.type || !["alias", "file"].includes(item.type) || !item.file) {
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
