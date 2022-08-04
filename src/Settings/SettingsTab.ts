import {App, PluginSettingTab, Setting} from "obsidian";
import MetaTitlePlugin from "../../main";
import Storage from "@src/Settings/Storage";
import {SettingsEvent, SettingsManagersType, SettingsType} from "@src/Settings/SettingsType";
import Dispatcher from "@src/EventDispatcher/Dispatcher";
import Event from "@src/EventDispatcher/Event";

export default class SettingsTab extends PluginSettingTab {
    changed = false;
    private previous: SettingsType;

    constructor(
        app: App,
        plugin: MetaTitlePlugin,
        private storage: Storage<SettingsType>,
        private dispatcher: Dispatcher<SettingsEvent>
    ) {
        super(app, plugin);
        this.updatePrevious();
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
                    this.changed = true;
                }));
        this.buildRules();
        this.buildManagers();
    }

    private buildRules(): void {
        this.containerEl.createEl('h4', {text: 'Rules'});
        const descriptions = {
            white: 'Files that are located by paths will be processed by plugin',
            black: 'Files that are located by paths will be ignored by plugin'
        };
        const setting = new Setting(this.containerEl).setName('File path rule');
        const getActual = () => this.storage.get('rules').get('paths').get('mode');
        const updateDesc = () => setting.setDesc(descriptions[getActual().value()]);
        updateDesc();
        console.log(this.storage.get('rules').get('paths').get('values').value());
        console.log(setting.controlEl);
        setting
            .addDropdown(e =>
                e.addOptions({white: 'White list mode', black: 'Black list mode'})
                    .setValue(getActual().value())
                    .onChange(e => {
                        this.changed = true;
                        getActual().set(e as 'black' | 'white');
                        updateDesc();
                    }).selectEl.style['marginRight'] = '10px')
            .addTextArea(e => e
                .setValue(this.storage.get('rules').get('paths').get('values').value().join('\n'))
                .onChange(v => {
                    this.changed = true;
                    this.storage.get('rules').get('paths').get('values').set(v.split('\n').filter(e => e));
                })
            )


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

    private updatePrevious(): void {
        this.previous = JSON.parse(JSON.stringify(this.storage.collect()));
    }

    hide(): any {
        super.hide();
        if (this.changed) {
            this.changed = false;
            this.dispatcher.dispatch('settings.changed', new Event({
                old: this.previous,
                actual: this.storage.collect()
            }));
            this.updatePrevious();
        }
    }
}