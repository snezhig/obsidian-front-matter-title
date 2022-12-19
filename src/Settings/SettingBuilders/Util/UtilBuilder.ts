import SettingBuilderInterface, { BuildParams } from "@src/Settings/Interface/SettingBuilderInterface";
import { SettingsType } from "@src/Settings/SettingsType";
import { ObjectItemInterface, PrimitiveItemInterface } from "@src/Storage/Interfaces";
import { injectable } from "inversify";
import { Setting } from "obsidian";

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

    private buildTitle(container: HTMLElement): void {
        if (!this.isTitleBuild) {
            container.createEl("h4", { text: "Util" });
            this.isTitleBuild = true;
        }
    }

    private buildDebug(item: DebugItem, container: HTMLElement): void {
        new Setting(container)
            .setName("Debug info")
            .setDesc("Show debug info and caught errors in console")
            .addToggle(e => e.setValue(item.value()).onChange(e => item.set(e)));
    }

    private buildBoot(item: BootItem, container: HTMLElement): void {
        new Setting(container)
            .setName("Boot delay")
            .setDesc("Plugin will be loaded with specified delay in ms")
            .addText(e =>
                e.setValue(item.get("delay").value().toString()).onChange(s => {
                    const v = !isNaN(parseInt(s)) ? parseInt(s) : 0;
                    e.setValue(v.toString());
                    item.get("delay").set(v);
                })
            );
    }

    support(k: keyof SettingsType): boolean {
        return ["boot", "debug"].includes(k);
    }
}
