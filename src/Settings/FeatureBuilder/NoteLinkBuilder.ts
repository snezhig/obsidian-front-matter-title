import AbstractBuilder from "./AbstractBuilder";
import { Feature } from "@src/Enum";
import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { DropdownComponent, Setting, ToggleComponent } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import { NoteLinkStrategy } from "@src/Feature/NoteLink/NoteLinkTypes";

export default class NoteLinkBuilder extends AbstractBuilder<Feature.NoteLink> {
    private id: Feature;
    private setting: Setting;
    private toggle: ToggleComponent;
    private approval: DropdownComponent;
    private strategy: DropdownComponent;

    build({ id, name, desc, settings, doc }: BuildParams<Feature.NoteLink>): void {
        this.id = id;
        const descFragment = createFragment(e => {
            e.createEl("a", { text: `[Doc]`, href: doc.link });
            e.createEl("br");
            e.createSpan({ text: desc });
        });
        this.setting = new Setting(this.context.getContainer()).setName(name).setDesc(descFragment);
        this.setting.addDropdown(e => (this.strategy = e));
        this.strategy
            .addOptions({
                [NoteLinkStrategy.All]: "Replace all links",
                [NoteLinkStrategy.OnlyEmpty]: "Replace only links without alias",
            })
            .setValue(settings.strategy ?? NoteLinkStrategy.OnlyEmpty)
            .onChange(this.onChange.bind(this));
        this.setting.addDropdown(e => (this.approval = e));
        this.approval
            .addOptions({ Y: "Show approve modal", N: "Use auto approve" })
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
