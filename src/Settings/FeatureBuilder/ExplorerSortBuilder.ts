import AbstractBuilder from "@src/Settings/FeatureBuilder/AbstractBuilder";
import {Feature} from "@src/enum";
import {BuildParams} from "@src/Settings/Interface/FeatureBuildInterface";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";
import {Setting, ToggleComponent} from "obsidian";
import Event from "@src/Components/EventDispatcher/Event";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import {SettingsEvent} from "@src/Settings/SettingsType";

export default class ExplorerSortBuilder extends AbstractBuilder<Feature.ExplorerSort> {
    private toggle: ToggleComponent = null;
    private setting: Setting = null;
    private cb: CallbackInterface<SettingsEvent['settings:tab:feature:changed']> = null;

    constructor() {
        super();
        this.cb = new CallbackVoid(e => {
            if (e.get().id === Feature.Explorer) {
                this.toggle.setValue(false);
                if (e.get().value.enabled) {
                    this.setting.settingEl.show();
                } else {
                    this.setting.settingEl.hide();
                }
            }
        });
    }

    build(options: BuildParams<Feature.ExplorerSort>): void {
        this.bind();
        this.setting = new Setting(this.context.containerEl).setName(options.name).setDesc(options.desc);
        this.setting.addToggle(c => this.toggle = c);
        this.toggle.setValue(options.settings.enabled)
            .onChange(v => this.context
                .getDispatcher()
                .dispatch('settings:tab:feature:changed', new Event({
                    id: options.id,
                    value: {enabled: v}
                })));
        if (!this.context.getSettings().features.explorer.enabled) {
            this.setting.settingEl.hide();
        }
    }

    private bind() {
        this.context.getDispatcher().addListener('settings:tab:feature:changed', this.cb);
    }
}