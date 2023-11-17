import { SettingsType } from "@src/Settings/SettingsType";
import PluginHelper from "@src/Utils/PluginHelper";
import { forEach } from "builtin-modules";

export class Migrator {
    constructor(private config: SettingsType) {}

    public migrate(version: string): SettingsType {
        if (this.config.version === version) {
            return this.config;
        }
        const versions = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(e => e.startsWith("v"))
            .map(e => e.replace("v", "").replaceAll("_", "."))
            .filter(e => PluginHelper.compareVersion(e, ">", this.config.version))
            .sort((a, b) => {
                if (PluginHelper.compareVersion(a, "<", b)) {
                    return -1;
                } else if (PluginHelper.compareVersion(a, ">", b)) {
                    return 1;
                }
                return 0;
            });
        for (const version of versions) {
            const method = "v" + version.replaceAll(".", "_");
            console.log(`Migrate from ${this.config.version} to ${version} by ${method}`);
            //@ts-ignore
            this[method]();
        }
        return this.config;
    }
    private v3_7_1(): void {
        return;
    }
    private v3_7_10(): void {
        return;
    }
    private v3_6_0(): void {
        return;
    }
    private v3_5_10(): void {
        return;
    }
    private v3_8_1(): void {
        return;
    }
}
