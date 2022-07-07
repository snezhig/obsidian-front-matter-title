// Example
import {SuggestModalExt, SuggestModalChooser, TAbstractFile, SuggestModal} from "obsidian";
import FunctionReplacer from "../../Utils/FunctionReplacer";
import Manager from "./Manager";
import Resolver from "../Resolver/Resolver";


type Replacers = {
    modal?: FunctionReplacer<SuggestModalExt<any>, 'open', QuickSwitcher>,
    chooser?: FunctionReplacer<SuggestModalChooser<any>, 'setSuggestions', QuickSwitcher>
}

export default class QuickSwitcher implements Manager {
    private replacers: Replacers = {};

    private state: boolean;

    constructor(
        private resolver: Resolver
    ) {
        this.replacers.modal = new FunctionReplacer<SuggestModalExt<any>, "open", QuickSwitcher>(
            SuggestModal.prototype, 'open', this, function (self, defaultArgs, vanilla) {
                self.createChooserReplacer.call(self, this);
                return vanilla.call(this, ...defaultArgs);
            }
        )
        this.replacers.modal.enable()
    }


    private createChooserReplacer(modal: SuggestModalExt<any>): void {
        console.log(modal);
        if (this.replacers.chooser) {
            return;
        }
        if (typeof modal?.chooser?.setSuggestions !== "function") {
            return;
        }
        this.replacers.chooser = new FunctionReplacer<SuggestModalChooser<any>, "setSuggestions", QuickSwitcher>(
            modal.chooser.__proto__,
            'setSuggestions',
            this,
            //TODO: make separate function
            function (self, defaultArgs, vanilla) {
                self.replacers.modal.disable();
                //TODO make more readable
                if (defaultArgs?.[0]?.[0]?.type === 'file') {
                    //TOOO: resolve new title
                    console.log(defaultArgs);
                }
                return vanilla.call(this, ...defaultArgs);
            }
        )
        this.replacers.chooser.enable();

    }

    disable(): Promise<void> | void {
        this.replacers.modal.disable();
        this.replacers?.chooser.disable();
        this.state = false;
    }

    enable(): Promise<void> | void {
        if (!this.replacers?.chooser.enable()) {
            this.replacers.modal.enable()
        }

        this.state = true;
    }

    isEnabled(): boolean {
        return this.state;
    }

    update(abstract?: TAbstractFile | null): Promise<boolean> {
        return Promise.resolve(false);
    }
}