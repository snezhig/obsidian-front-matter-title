import AbstractBuilder from "./AbstractBuilder";
import { Feature } from "@src/Enum";
import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import { NoteLinkStrategy } from "@src/Feature/NoteLink/NoteLinkTypes";
import { t } from "../../i18n/Locale";

export default class NoteLinkBuilder extends AbstractBuilder<Feature.NoteLink> {
    private id: Feature;
    private setting: Setting;
    private toggle: ToggleComponent;
    private approval: DropdownComponent;
    private strategy: DropdownComponent;

    doBuild(): void {
        const { id, name, desc, settings, doc } = this.options;
        this.id = id;
        const fragment = createFragment(e => e.createEl("a", { text: name, href: doc.link }));
        this.setting = new Setting(this.context.getContainer()).setName(fragment).setDesc(desc);
        this.setting.addDropdown(e => (this.strategy = e));
        this.strategy
            .addOptions({
                [NoteLinkStrategy.All]: t("feature.noteLink.strategy.all"),
                [NoteLinkStrategy.OnlyEmpty]: t("feature.noteLink.strategy.onlyEmpty"),
            })
            .setValue(settings.strategy ?? NoteLinkStrategy.OnlyEmpty)
            .onChange(this.onChange.bind(this));
        this.setting.addDropdown(e => (this.approval = e));
        this.approval
            .addOptions({ Y: t("feature.noteLink.approval.showModal"), N: t("feature.noteLink.approval.auto") })
            .setValue(settings.approval ? "Y" : "N")
            .onChange(this.onChange.bind(this));
        this.setting.addToggle(e => (this.toggle = e));
        this.toggle.setValue(settings.enabled).onChange(this.onChange.bind(this));
    }

    private onChange(): void {
        this.context.getDispatcher().dispatch(
            "settings:tab:feature:changed",
            new Event({
                id: this.id,
                value: {
                    enabled: this.toggle.getValue(),
                    approval: this.approval.getValue() === "Y",
                    strategy: this.strategy.getValue(),
                },
            })
        );
    }
}
