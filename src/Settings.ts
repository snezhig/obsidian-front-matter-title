import {App, PluginSettingTab, Setting} from "obsidian";
import MetaTitle from "../main";

type MetaTitleSettings = {
	path: string,
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
			path: 'title'
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
		public plugin: MetaTitle
	) {
		super(app, plugin);
	}

	hide(): any {
		console.log('hide');
		return super.hide();
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
	}
}
