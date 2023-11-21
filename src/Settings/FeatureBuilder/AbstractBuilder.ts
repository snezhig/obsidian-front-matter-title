import FeatureBuildInterface, {
    BuildParams,
    BuildSettingConfig,
    Context,
} from "@src/Settings/Interface/FeatureBuildInterface";
import { SettingsType, TemplateValue } from "@src/Settings/SettingsType";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { ButtonComponent, Modal, Setting } from "obsidian";
import { t } from "@src/i18n/Locale";
import { ObsidianModalFactory } from "@config/inversify.factory.types";
import Storage from "@src/Storage/Storage";
import Event from "@src/Components/EventDispatcher/Event";
import { Feature } from "@src/Enum";

@injectable()
export default abstract class AbstractBuilder<K extends Feature = null> implements FeatureBuildInterface<K> {
    protected id: Feature;
    protected options: BuildParams<K>;
    protected config: BuildSettingConfig<K>;
    protected context: Context;
    private manageButton: ButtonComponent;

    constructor(
        @inject(SI["settings:storage"])
        private storage: Storage<SettingsType>,
        @inject(SI["factory:obsidian:modal"])
        private factory: ObsidianModalFactory
    ) {}

    setContext(context: Context): void {
        this.context = context;
    }

    build(options: BuildParams<K>): void {
        this.options = options;
        this.id = options.id;
        this.config = options.config;
        this.doBuild();
    }

    doBuild(): void {}

    protected dispatchChanges(): void {
        this.context
            .getDispatcher()
            .dispatch("settings:tab:feature:changed", new Event({ id: this.options.id, value: this.config }));
    }

    protected buildEnable(): Setting {
        const fragment = this.options.doc?.link
            ? createFragment(e =>
                  e.createEl("a", {
                      text: this.options.name,
                      href: this.options.doc.link,
                  })
              )
            : this.options.name;
        return new Setting(this.context.getContainer())
            .setName(fragment)
            .setDesc(this.options.desc)
            .addButton(b => {
                this.manageButton = b.setButtonText(t("manage")).onClick(() => {
                    const modal = this.factory();
                    modal.titleEl.setText(this.options.name);
                    this.onModalShow(modal);
                    modal.open();
                });
                this.toggleManageButtonVisible();
            })
            .addToggle(e =>
                e.setValue(this.options.config.enabled).onChange(v => {
                    this.options.config.enabled = v;
                    this.toggleManageButtonVisible();
                    this.dispatchChanges();
                })
            );
    }

    protected abstract onModalShow(modal: Modal): void;

    protected buildTemplates(el: HTMLElement): void {
        const templateStorage = this.storage.get("templates");
        for (const type of ["main", "fallback"] as (keyof TemplateValue)[]) {
            const tStorage = this.storage.get("features").get(this.id).get("templates").get(type);
            const setting = new Setting(el)
                .setName(t(`template.${type}`))
                .setDesc(this.getDesc(type, tStorage.value()))
                .addText(e => {
                    e.setValue(tStorage.value() ?? "")
                        .setPlaceholder(templateStorage.get("common").get(type).value())
                        .onChange(v => {
                            setting.setDesc(this.getDesc(type, v));
                            this.config.templates[type] = v;
                            this.dispatchChanges();
                        });
                });
        }
    }

    private toggleManageButtonVisible(): void {
        this.manageButton.buttonEl.toggleVisibility(this.config.enabled);
    }

    private getDesc(type: keyof TemplateValue, value: string | null): string {
        if (value) {
            return t("template.specific");
        } else {
            return t("template.used", { value: this.storage.get("templates").get("common").get(type).value() });
        }
    }
}
