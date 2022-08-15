import Manager from "@src/Title/Manager/Manager";
import {MarkdownView, TAbstractFile, TFile} from "obsidian";
import SI, {FactoriesType} from "@config/inversify.types";
import {inject, named} from "inversify";
import {getLeavesOfType} from "@src/Obsidian/Types";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";

export default class LinkNoteManager implements Manager {
    private enabled = false;

    constructor(
        @inject(SI['factory:obsidian:file_modifiable'])
        private fileModifiableFactory: FactoriesType['factory:obsidian:file_modifiable'],
        @inject(SI['factory:obsidian:file'])
        private fileFactory: FactoriesType['factory:obsidian:file'],
        @inject(SI['getter:obsidian:leaves'])
        private leavesGetter: getLeavesOfType,
        @inject(SI['resolver']) @named(Resolving.Sync)
        private resolver: ResolverInterface
    ) {
    }

    disable(): void {
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    async update(abstract?: TAbstractFile | null): Promise<boolean> {
        const leaves = this.leavesGetter('markdown');
        if(!leaves.length){
            return false;
        }
        const promises = [];
        for(const leaf of leaves){
            if((leaf.view as MarkdownView)?.file){
                promises.push(this.process((leaf.view as MarkdownView).file))
            }
        }

        return false;
    }
    private async process(file: TFile){
    }

}