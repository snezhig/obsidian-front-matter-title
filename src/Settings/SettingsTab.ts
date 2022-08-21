import {App, PluginSettingTab, Setting, TextComponent} from "obsidian";
import MetaTitlePlugin from "../../main";
import Storage, {PrimitiveItemInterface} from "@src/Settings/Storage";
import {SettingsEvent, SettingsManagersType, SettingsType} from "@src/Settings/SettingsType";
import Event from "@src/Components/EventDispatcher/Event";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";

export default class SettingsTab extends PluginSettingTab {
    changed = false;
    private previous: SettingsType;

    constructor(
        app: App,
        plugin: MetaTitlePlugin,
        private storage: Storage<SettingsType>,
        private dispatcher: DispatcherInterface<SettingsEvent>
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
            .setName('Template')
            .setDesc('Set a yaml path, which value will be used as a file title. Value must be string or numeric. Also you can use template-like path using "{{ }}". See Readme to find out')
            .addText(text => text
                .setPlaceholder('Type a template')
                .setValue(this.storage.get('templates').value()?.[0] ?? '')
                .onChange(async (value) => {
                    this.storage.get('templates').value().splice(0, 1, value);
                    this.changed = true;
                }));

        new Setting(containerEl)
            .setName('Template fallback')
            .setDesc('This template will be used as a fallback option if the main template is not resolved')
            .addText(text => text
                .setPlaceholder('Type a template')
                .setValue(this.storage.get('templates').value()?.[1] ?? '')
                .onChange(v => {
                    this.storage.get('templates').value().splice(1, 1, v);
                    this.changed = true;
                })
            );
        this.buildRules();
        this.buildManagers();
        containerEl.createEl('h4', {text: 'Util'});
        new Setting(containerEl)
            .setName('Debug info')
            .setDesc('Show debug info and caught errors in console')
            .addToggle(e =>
                e.setValue(this.storage.get('debug').value())
                    .onChange(e => this.change(this.storage.get('debug'), e))
            );
        new Setting(containerEl)
            .setName('Boot delay')
            .setDesc('Plugin will be loaded with specified delay in ms')
            .addText(e =>
                e.setValue(this.storage.get('boot').get('delay').value().toString())
                    .onChange(s => {
                        const v = !isNaN(parseInt(s)) ? parseInt(s) : 0;
                        e.setValue(v.toString());
                        this.change(this.storage.get('boot').get('delay'), v);
                    })
            );

    }

    private buildRules(): void {
        this.containerEl.createEl('h4', {text: 'Rules'});
        this.buildRulePaths();
        this.buildRuleDelimiter();

    }

    private buildRulePaths(): void {
        const descriptions = {
            white: 'Files that are located by paths will be processed by plugin. Each path must be written with new line.',
            black: 'Files that are located by paths will be ignored by plugin. Each path must be written with new line.'
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
                        this.change(getActual(), e as ('black' | 'white'));
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
        const setting = new Setting(this.containerEl).setName('List values').setDesc('Set the rule about how to process list values');
        let text: TextComponent = null;
        const delimiter = this.storage.get('rules').get('delimiter');
        const isEnabled = () => delimiter.get('enabled').value();
        const getPlaceholder = () => isEnabled() ? 'Type a delimiter' : 'First value will be used';

        const onDropdownChange = (e: boolean) => {
            this.change(delimiter.get('enabled'), e);
            text.setValue('').setPlaceholder(getPlaceholder()).setDisabled(!e).onChanged();
            text.inputEl.hidden = !isEnabled();
        }
        setting.addDropdown(e => e
            .addOptions({N: 'Use first value', Y: 'Join all by delimiter'})
            .setValue(delimiter.get('enabled').value() ? 'Y' : 'N')
            .onChange(e => onDropdownChange(e === 'Y')).selectEl.style['marginRight'] = '10px')
            .addText(e =>
                text = e
                    .onChange(e => this.change(delimiter.get('value'), e))
                    .setValue(delimiter.get('value').value())
                    .setDisabled(!isEnabled())
                    .setPlaceholder(getPlaceholder())
            );
        text.inputEl.hidden = !isEnabled();
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
                    .onChange(v => this.change(this.storage.get('managers').get(item.manager), v))
                )
        }
    }

    private updatePrevious(): void {
        this.previous = JSON.parse(JSON.stringify(this.storage.collect()));
    }

    private change<T>(o: PrimitiveItemInterface<T>, v: T) {
        o.set(v);
        this.changed = true;
    }

    hide(): any {
        super.hide();
        this.dispatch();

    }

    private dispatch(): void {
        if (!this.changed) {
            return;
        }

        this.changed = false;
        this.dispatcher.dispatch('settings.changed', new Event({
            old: this.previous,
            actual: this.storage.collect()
        }));
        this.updatePrevious();
    }
}