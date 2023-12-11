import AbstractBuilder from "@src/Settings/FeatureBuilder/AbstractBuilder";
import { Feature } from "@src/Enum";
import { Modal, Setting } from "obsidian";
import { t } from "@src/i18n/Locale";

export default class ExplorerBuilder extends AbstractBuilder<Feature.Explorer> {
    doBuild(): void {
        this.buildEnable();
    }

    protected onModalShow(modal: Modal) {
        const el = modal.contentEl;
        this.buildSort(el);
        this.buildTemplates(el);
    }

    private buildSort(el: HTMLElement): void {
        new Setting(el)
            .setName(t("feature.explorer.sort.name"))
            .setDesc(t("feature.explorer.sort.desc"))
            .addToggle(e => {
                e.setValue(this.config.sort).onChange(v => {
                    this.config.sort = v;
                    this.dispatchChanges();
                });
            });
    }
}
