import {App, PluginSettingTab, Setting} from "obsidian";
import MetaTitlePlugin from "../main";

type Aliases = { [k in keyof MetaTitleSettings]?: keyof MetaTitleSettings };
const aliases: Aliases = {
    explorer_enabled: 'm_explorer',
    graph_enabled: 'm_graph'
}

type MetaTitleSettings = {
    path: string,
    excluded_folders: string[],
    m_markdown: boolean,
    m_graph: boolean,
    m_explorer: boolean,
    explorer_enabled?: boolean,
    graph_enabled?: boolean
}

export class Settings {
    private readonly settings: MetaTitleSettings;

    public constructor(
        current: MetaTitleSettings,
        private cb: (s: MetaTitleSettings) => void
    ) {
        this.settings = Object.assign({}, Settings.getDefault(), current);
        const als = Object.entries(aliases) as [keyof MetaTitleSettings, keyof MetaTitleSettings][];
        for (const [k, v] of als) {
            if (this.settings[k] !== undefined) {
                //@ts-ignore
                this.settings[v] = this.settings[k];
                delete this.settings[k];
            }
        }
    }

    private static getDefault(): MetaTitleSettings {
        return {
            path: 'title',
            excluded_folders: [],
            m_graph: true,
            m_explorer: true,
            m_markdown: true
        };
    }

    public set<K extends keyof MetaTitleSettings>(key: K, value: MetaTitleSettings[K]): void {
        this.settings[key] = value;
        this.cb(this.getAll());
    }

    public get<K extends keyof MetaTitleSettings>(key: K): MetaTitleSettings[K] {
        return this.settings[key];
    }

    public getAll(): MetaTitleSettings {
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
            .setName('Meta title path')
            .setDesc('Set a yaml path, which value will be used as a file title. Value must be string or numeric. Also you can use template-like path using "{{ }}". See Readme to find out')
            .addText(text => text
                .setPlaceholder('Type path')
                .setValue(this.plugin.settings.get('path'))
                .onChange(async (value) => {
                    this.plugin.settings.set('path', value);
                }));
        new Setting(containerEl)
            .setName('Exclude folders')
            .setDesc('Set excluded folders and files in this folders will not be parsed')
            .addTextArea(e => e
                .setValue(this.plugin.settings.get('excluded_folders').join('\n'))
                .onChange(async v => {
                    this.plugin.settings.set('excluded_folders', v.split('\n').filter(e => e))
                }));
        new Setting(containerEl)
            .setName('Enable explorer titles')
            .setDesc('If it is on, plugin will replace titles in file explorer and update them')
            .addToggle(e => e
                .setValue(this.plugin.settings.get('m_explorer'))
                .onChange(async v => {
                    this.plugin.settings.set('m_explorer', v)
                }));
        new Setting(containerEl)
            .setName('Enable graph titles')
            .setDesc('If it is on, plugin will replace titles in graph and update them')
            .addToggle(e => e
                .setValue(this.plugin.settings.get('m_graph'))
                .onChange(async v => {
                    this.plugin.settings.set('m_graph', v);
                }));
        new Setting(containerEl)
            .setName('Enable leaf`s header titles')
            .setDesc('If it is on, plugin will replace titles in graph and update them. Also it will prevent click on header to avoid accidentally renaming')
            .addToggle(e => e
                .setValue(this.plugin.settings.get('m_markdown'))
                .onChange(async v => {
                    this.plugin.settings.set('m_markdown', v);
                }));
    }
}
