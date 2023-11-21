import AbstractBuilder from "@src/Settings/FeatureBuilder/AbstractBuilder";
import { Feature } from "@src/Enum";
import { Modal, Setting } from "obsidian";

export default class ExplorerBuilder extends AbstractBuilder<Feature.Explorer> {
    private extraSettingContainerEl: HTMLDivElement;

    doBuild(): void {
        this.buildEnable();
        this.extraSettingContainerEl = this.context.getContainer().createDiv();
    }

    protected onModalShow(modal: Modal) {
        const el = modal.contentEl;
        this.buildSort(el);
        this.buildTemplates(el);
    }

    private buildSort(el: HTMLElement): void {
        new Setting(el)
            .setName("Sort")
            .setDesc("Sort for explorer")
            .addToggle(e => {
                e.setValue(this.config.sort).onChange(v => {
                    this.config.enabled = v;
                    this.dispatchChanges();
                });
            });
    }
}
