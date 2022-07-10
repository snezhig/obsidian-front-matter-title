//TODO: separate it, make more readable.
import {App, PluginSettingTab, Setting, TextComponent} from "obsidian";
import MetaTitlePlugin from "../main";

type Aliases = { [k in keyof TSettings]?: keyof TSettings };
const aliases: Aliases = {
    explorer_enabled: 'm_explorer',
    graph_enabled: 'm_graph'
}

type TSettings = {
    path: string,
    list_pattern: true | string
    excluded_folders: string[],
    m_markdown: boolean,
    m_graph: boolean,
    m_explorer: boolean,
    m_quick_switcher: boolean,
    explorer_enabled?: boolean,
    graph_enabled?: boolean,
}

export class Settings {
    private readonly settings: TSettings;

    public constructor(
        current: TSettings,
        private cb: (s: TSettings) => void
    ) {
        this.settings = Object.assign({}, Settings.getDefault(), current);
        const als = Object.entries(aliases) as [keyof TSettings, keyof TSettings][];
        for (const [k, v] of als) {
            if (this.settings[k] !== undefined) {
                //@ts-ignore
                this.settings[v] = this.settings[k];
                delete this.settings[k];
            }
        }
    }

    private static getDefault(): TSettings {
        return {
            path: 'title',
            list_pattern: true,
            excluded_folders: [],
            m_graph: true,
            m_explorer: true,
            m_markdown: true,
            m_quick_switcher: true
        };
    }

    public set<K extends keyof TSettings>(key: K, value: TSettings[K]): void {
        this.settings[key] = value;
        console.log(key, value);
        this.cb(this.getAll());
    }

    public get<K extends keyof TSettings>(key: K): TSettings[K] {
        return this.settings[key];
    }

    public getAll(): TSettings {
        return this.settings;
    }
}

export class SettingsTab extends PluginSettingTab {

    constructor(
        app: App,
        public plugin: MetaTitlePlugin
    ) {
        super(app, plugin);
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();
        containerEl.createEl('h2', {text: 'Settings for plugin.'});

        new Setting(containerEl)
            .setName('Front matter title path')
            .setDesc('Set a yaml path, which value will be used as a file title. Value must be string or numeric. Also you can use template-like path using "{{ }}". See Readme to find out')
            .addText(text => text
                .setPlaceholder('Type path')
                .setValue(this.plugin.settings.get('path'))
                .onChange(async (value) => {
                    this.plugin.settings.set('path', value);
                }));

        this.buildDelimiter();

        new Setting(containerEl)
            .setName('Exclude folders')
            .setDesc('Set excluded folders and files in this folders will not be parsed')
            .addTextArea(e => e
                .setValue(this.plugin.settings.get('excluded_folders').join('\n'))
                .onChange(async v => {
                    this.plugin.settings.set('excluded_folders', v.split('\n').filter(e => e))
                }));

        this.buildMangers();
    }

    private buildMangers(): void {
        this.containerEl.createEl('h4', {text: 'Managers'});
        new Setting(this.containerEl)
            .setName('Enable explorer titles')
            .setDesc('If it is on, plugin will replace titles in file explorer and update them')
            .addToggle(e => e
                .setValue(this.plugin.settings.get('m_explorer'))
                .onChange(async v => {
                    this.plugin.settings.set('m_explorer', v)
                }));
        new Setting(this.containerEl)
            .setName('Enable graph titles')
            .setDesc('If it is on, plugin will replace titles in graph and update them')
            .addToggle(e => e
                .setValue(this.plugin.settings.get('m_graph'))
                .onChange(async v => {
                    this.plugin.settings.set('m_graph', v);
                }));
        new Setting(this.containerEl)
            .setName('Enable leaf`s header titles')
            .setDesc('If it is on, plugin will replace titles in graph and update them. Also it will prevent click on header to avoid accidentally renaming')
            .addToggle(e => e
                .setValue(this.plugin.settings.get('m_markdown'))
                .onChange(async v => {
                    this.plugin.settings.set('m_markdown', v);
                }));
        new Setting(this.containerEl)
            .setName('Enable quick switcher titles')
            .setDesc('If it is on, plugin will replace titles in quick switcher modal if items are not aliases. It won`t affect on search logic')
            .addToggle(e => e
                .setValue(this.plugin.settings.get('m_quick_switcher'))
                .onChange(async v => {
                    this.plugin.settings.set('m_quick_switcher', v);
                }));
    }

    private buildDelimiter(): void {

        const list = new Setting(this.containerEl)
            .setName('List value behaviour')
            .setDesc('Plugin can use first value from list values or join all once by delimiter');


        let text: TextComponent = null;

        list.addDropdown(e =>
            e.addOptions({true: 'Use first value', delimiter: 'Join all by delimiter'})
                .setValue(this.plugin.settings.get('list_pattern') === true ? 'true' : 'delimiter')
                .onChange(e => toggleText(e === 'delimiter'))
        );

        list.addText(e => {
            text = e.onChange(v => this.plugin.settings.set('list_pattern', v))
        });

        const toggleText = (enabled: boolean) => {
            if (!enabled) {
                text.setValue('').setPlaceholder('First value will be used').setDisabled(true);
                this.plugin.settings.set('list_pattern', true);
            } else {
                text.setValue(this.plugin.settings.get('list_pattern') as string).setPlaceholder('Type a delimiter').setDisabled(false);
            }
        }
        toggleText(this.plugin.settings.get('list_pattern') !== true);
    }
}
