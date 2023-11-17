import AbstractBuilder from "@src/Settings/FeatureBuilder/AbstractBuilder";
import { Feature } from "@src/Enum";
import { BuildParams } from "@src/Settings/Interface/FeatureBuildInterface";
import { Setting, ToggleComponent } from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";

export default class ExplorerSortBuilder extends AbstractBuilder<Feature.ExplorerSort> {
    private toggle: ToggleComponent = null;
    private setting: Setting = null;
    private ref: ListenerRef<"settings:tab:feature:changed"> = null;

    doBuild(): void {
        this.bind();
        this.setting = new Setting(this.context.getContainer())
            .setName(this.options.name)
            .setDesc(this.options.desc)
            .setClass("setting-feature-name");
        this.setting.addToggle(c => (this.toggle = c));
        this.toggle.setValue(this.options.config.enabled).onChange(v => {
            this.config.enabled = v;
            this.dispatchChanges();
        });
        if (!this.context.getSettings().explorer.enabled) {
            this.setting.settingEl.hide();
        }
    }

    private bind() {
        this.ref = this.context.getDispatcher().addListener({
            name: "settings:tab:feature:changed",
            cb: e => {
                if (e.get().id === Feature.Explorer) {
                    this.toggle.setValue(false);
                    if (e.get().value.enabled) {
                        this.setting.settingEl.show();
                    } else {
                        this.setting.settingEl.hide();
                    }
                }
            },
        });
        this.context.getDispatcher().addListener({
            name: "settings:tab:close",
            once: true,
            cb: () => {
                this.context.getDispatcher().removeListener(this.ref);
                this.ref = null;
            },
        });
    }
}
