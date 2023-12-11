import AbstractBuilder from "./AbstractBuilder";
import { Feature } from "@src/Enum";
import { DropdownComponent, Modal, Setting } from "obsidian";
import { NoteLinkStrategy } from "@src/Feature/NoteLink/NoteLinkTypes";
import { t } from "@src/i18n/Locale";

export default class NoteLinkBuilder extends AbstractBuilder<Feature.NoteLink> {
    private approval: DropdownComponent;
    private strategy: DropdownComponent;

    doBuild(): void {
        this.buildEnable();
    }

    protected onModalShow(modal: Modal) {
        this.buildStrategy(modal.contentEl);
        this.buildApproval(modal.contentEl);
        this.buildTemplates(modal.contentEl);
    }

    private buildStrategy(el: HTMLElement): void {
        new Setting(el)
            .setName(t("feature.noteLink.strategy.name"))
            .setDesc(t("feature.noteLink.strategy.desc"))
            .addDropdown(e => {
                e.addOptions({
                    [NoteLinkStrategy.All]: t("feature.noteLink.strategy.options.all"),
                    [NoteLinkStrategy.OnlyEmpty]: t("feature.noteLink.strategy.options.onlyEmpty"),
                })
                    .setValue(this.config.strategy ?? NoteLinkStrategy.OnlyEmpty)
                    .onChange(v => {
                        this.config.strategy = v as NoteLinkStrategy;
                        this.dispatchChanges();
                    });
            });
    }

    private buildApproval(el: HTMLElement): void {
        new Setting(el)
            .setName(t("feature.noteLink.approval.name"))
            .setDesc(t("feature.noteLink.approval.desc"))
            .addDropdown(e => {
                e.addOptions({
                    Y: t("feature.noteLink.approval.options.showModal"),
                    N: t("feature.noteLink.approval.options.auto"),
                })
                    .setValue(this.config.approval ? "Y" : "N")
                    .onChange(v => {
                        this.config.approval = v === "Y";
                        this.dispatchChanges();
                    });
            });
    }
}
