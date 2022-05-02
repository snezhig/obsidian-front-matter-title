import {App, PluginSettingTab, Setting} from "obsidian";
import MetaTitlePlugin from "../main";

type MetaTitleSettings = {
	path: string,
	excluded_folders: string[],
	graph_enabled: boolean
}

export class Settings {
	private readonly settings: MetaTitleSettings;

	private constructor(
		current: MetaTitleSettings
	) {
		this.settings = Object.assign({}, Settings.getDefault(), current);
	}

	private static getDefault(): MetaTitleSettings {
		return {
			path: 'title',
			excluded_folders: [],
			graph_enabled: true
		};
	}

	public set<K extends keyof MetaTitleSettings>(key: K, value: MetaTitleSettings[K]): void {
		this.settings[key] = value;
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

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Meta title path')
			.setDesc('Set a yaml path, which value will be used as a file title. Value must be string or numeric')
			.addText(text => text
				.setPlaceholder('Type path')
				.setValue(this.plugin.settings.get('path'))
				.onChange(async (value) => {
					this.plugin.settings.set('path', value);
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Exclude folders')
			.setDesc('Set excluded folders and files in this folders will not be parsed')
			.addTextArea(e => e
				.setValue(this.plugin.settings.get('excluded_folders').join('\n'))
				.onChange(async v => {
					this.plugin.settings.set('excluded_folders', v.split('\n').filter(e => e))
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Enable graph titles')
			.setDesc('If it is on, plugin will replace titles in graph and update them')
			.addToggle(e => e
				.setValue(this.plugin.settings.get('graph_enabled'))
				.onChange(async v => {
					this.plugin.settings.set('graph_enabled', v);
					await this.plugin.saveSettings();
				}));
	}
}
