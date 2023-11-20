import AbstractBuilder from "@src/Settings/FeatureBuilder/AbstractBuilder";
import { Feature } from "@src/Enum";
import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { Setting, ToggleComponent } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";

export default class ExplorerBuilder extends AbstractBuilder<Feature.Explorer> {
    private extraSettingContainerEl: HTMLDivElement;

    doBuild(): void {
        this.buildEnable();
        this.extraSettingContainerEl = this.context.getContainer().createDiv();
        this.buildSort();
        this.addTemplateManageButton();
    }
    private buildSort(): void{
        new Setting(this.getExtraSettingContainer())
        .setName("Sort")
        .setDesc("Sort for explorer")
        .addToggle(e => {
            e.setValue(this.config.sort)
            .onChange(v => {
                this.config.enabled = v;
                this.dispatchChanges();
            })
        })
    }
    protected getExtraSettingContainer(): HTMLElement {
        return this.extraSettingContainerEl;
    }
}
