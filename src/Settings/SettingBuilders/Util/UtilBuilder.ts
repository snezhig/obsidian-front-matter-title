import SettingBuilderInterface, { BuildParams } from "@src/Settings/Interface/SettingBuilderInterface";
import { SettingsType } from "@src/Settings/SettingsType";
import { ObjectItemInterface, PrimitiveItemInterface } from "@src/Storage/Interfaces";
import { injectable } from "inversify";
import { Setting } from "obsidian";
import { t } from "@src/i18n/Locale";

type BootItem = ObjectItemInterface<SettingsType["boot"]>;
type DebugItem = PrimitiveItemInterface<SettingsType["debug"]>;

@injectable()
export default class UtilBuilder implements SettingBuilderInterface<SettingsType, "boot" | "debug"> {
    private isTitleBuild = false;

    build({ name, item, container }: BuildParams<SettingsType, "boot" | "debug">): void {
        this.buildTitle(container);
        switch (name) {
            case "boot": {
                this.buildBoot(item as BootItem, container);
                break;
            }
            case "debug": {
                this.buildDebug(item as DebugItem, container);
                break;
            }
        }
    }

    support(k: keyof SettingsType): boolean {
        return ["boot", "debug"].includes(k);
    }

    private buildTitle(container: HTMLElement): void {
        if (!this.isTitleBuild) {
            container.createEl("h4", { text: t("util") });
            this.isTitleBuild = true;
        }
    }

    private buildDebug(item: DebugItem, container: HTMLElement): void {
        new Setting(container)
            .setName(t("debug_info.title"))
            .setDesc(t("debug_info.desc"))
            .addToggle(e => e.setValue(item.value()).onChange(e => item.set(e)));
    }

    private buildBoot(item: BootItem, container: HTMLElement): void {
        new Setting(container)
            .setName(t("boot_delay.title"))
            .setDesc(t("boot_delay.desc"))
            .addText(e =>
                e.setValue(item.get("delay").value().toString()).onChange(s => {
                    const v = !isNaN(parseInt(s)) ? parseInt(s) : 0;
                    e.setValue(v.toString());
                    item.get("delay").set(v);
                })
            );
        new Setting(container)
            .setName(t("boot_background.title"))
            .setDesc(t("boot_background.desc"))
            .addToggle(e =>
                e.setValue(item.get("background").value()).onChange(e => {
                    item.get("background").set(e);
                })
            );
    }
}
