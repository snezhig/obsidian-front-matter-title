import {App, PluginSettingTab, Setting, TextComponent} from "obsidian";
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
        this.dispatcher.dispatch('settings.loaded', new Event({settings: this.storage.collect()}))
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
                .setValue(this.storage.get('template').value())
                .onChange(async (value) => {
                    this.storage.get('template').set(value);
                    this.changed = true;
                }));
        this.buildRules();
        this.buildManagers();
    }

    private buildRules(): void {
        this.containerEl.createEl('h4', {text: 'Rules'});
        this.buildRulePaths();
        this.buildRuleDelimiter();

    }

    private buildRulePaths(): void {
        const descriptions = {
            white: 'Files that are located by paths will be processed by plugin',
            black: 'Files that are located by paths will be ignored by plugin'
        };
        const setting = new Setting(this.containerEl).setName('File path rule');
        const getActual = () => this.storage.get('rules').get('paths').get('mode');
        const updateDesc = () => setting.setDesc(descriptions[getActual().value()]);
        updateDesc();
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

    private buildRuleDelimiter(): void {
        const setting = new Setting(this.containerEl).setName('List values');
        let text: TextComponent = null;
        const isEnabled = () => this.storage.get('rules').get('delimiter').get('enabled').value();
        const getPlaceholder = () => isEnabled() ? 'Type a delimiter' : 'First value will be used';

        const onDropdownChange = (e: boolean) => {
            this.changed = true;
            this.storage.get('rules').get('delimiter').get('enabled').set(e);
            text.setValue('').setPlaceholder(getPlaceholder()).setDisabled(!e).onChanged();
        }
        setting.addDropdown(e => e
            .addOptions({N: 'Use first value', Y: 'Join all by delimiter'})
            .setValue(this.storage.get('rules').get('delimiter').get('enabled').value() ? 'Y' : 'N')
            .onChange(e => onDropdownChange(e === 'Y')).selectEl.style['marginRight'] = '10px')
            .addText(e =>
                text = e.onChange(e => {
                    this.changed = true;
                    this.storage.get('rules').get('delimiter').get('value').set(e);
                }).setDisabled(!isEnabled()).setPlaceholder(getPlaceholder()));
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