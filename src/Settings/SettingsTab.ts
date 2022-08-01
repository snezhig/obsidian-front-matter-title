import {App, PluginSettingTab, Setting} from "obsidian";
import MetaTitlePlugin from "../../main";
import Storage from "@src/Settings/Storage";
import {SettingsEvent, SettingsManagersType, SettingsType} from "@src/Settings/SettingsType";
import Dispatcher from "@src/EventDispatcher/Dispatcher";
import Event from "@src/EventDispatcher/Event";

export default class SettingsTab extends PluginSettingTab {
    changed = false;

    constructor(
        app: App,
        plugin: MetaTitlePlugin,
        private storage: Storage<SettingsType>,
        private dispatcher: Dispatcher<SettingsEvent>
    ) {
        super(app, plugin);
    }

    display(): any {
        const {containerEl} = this;

        containerEl.empty();
        containerEl.createEl('h2', {text: 'Settings for plugin.'});

        new Setting(containerEl)
            .setName('Front matter title path')
            .setDesc('Set a yaml path, which value will be used as a file title. Value must be string or numeric. Also you can use template-like path using "{{ }}". See Readme to find out')
            .addText(text => text
                .setPlaceholder('Type path')
                .setValue(this.storage.get('path').value())
                .onChange(async (value) => {
                    this.storage.get('path').set(value);
                }));

        this.buildManagers();
    }

    private buildManagers(): void {
        this.containerEl.createEl('h4', {text: 'Managers'});
        const data: { manager: SettingsManagersType, name: string, desc: string }[] = [
            {
                manager: 'header',
                name: 'Enable header title',
                desc: 'If it is on, plugin will replace titles in header of leaves and update them'
            },
            {manager: 'explorer', name: 'Enable explorer title', desc: 'Replace shown titles in the file explorer'},
            {manager: 'graph', name: 'Enable graph title', desc: 'Replace shown titles in the graph/local-graph'},
            {
                manager: 'quick_switcher',
                name: 'Enable quick switches title',
                desc: 'Replace shown titles in the quick switcher modal'
            },
        ]
        for (const item of data) {
            new Setting(this.containerEl)
                .setName(item.name)
                .setDesc(item.desc)
                .addToggle(e => e
                    .setValue(this.storage.get("managers").get(item.manager).value())
                    .onChange(v => {
                        this.storage.get('managers').get(item.manager).set(v)
                        this.changed = true;
                    })
                )
        }
    }

    hide(): any {
        super.hide();
        if (this.changed) {
            this.changed = false;
            this.dispatcher.dispatch('settings.changed', new Event(this.storage.collect()));
        }
    }
}