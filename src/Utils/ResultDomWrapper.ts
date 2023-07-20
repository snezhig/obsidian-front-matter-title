import { SearchDOM, TFile } from "obsidian";
import { ResolverInterface } from "../Resolver/Interfaces";
import FunctionReplacer from "./FunctionReplacer";

export default class ResultDomWrapper {
    private replacer: FunctionReplacer<SearchDOM, "addResult", ResultDomWrapper> = null;
    constructor(private resolver: ResolverInterface = null, dom: SearchDOM) {
        this.replacer = FunctionReplacer.create(dom, "addResult", this, (self, defaultArgs, vanilla) => {
            const c = vanilla.call(dom, ...defaultArgs);
            const file = defaultArgs[0];
            self.processLookupItem(file, c);
            return c;
        });
        this.replacer.enable();
        this.process();
    }

    public disable(): void {
        this.replacer.disable();
        this.replacer = null;
    }

    private process(): void {
        const lookup = this.replacer?.getTarget()?.resultDomLookup ?? new Map();
        for (const [file, item] of lookup) {
            this.processLookupItem(file, item);
        }
    }
    private processLookupItem(file: TFile, item: any): void {
        const restore = !this?.replacer?.isEnabled();
        if (file.extension !== "md") {
            return;
        }
        const node = item.containerEl.firstElementChild.find(".tree-item-inner");
        const text = (restore ? null : this.resolver.resolve(file.path)) ?? file.basename;
        if (node.getText() !== text) {
            node.setText(text);
        }
    }
}
