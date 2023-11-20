import { SettingsType } from "@src/Settings/SettingsType";
import PluginHelper from "@src/Utils/PluginHelper";
import { forEach } from "builtin-modules";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import Event from "@src/Components/EventDispatcher/Event";
import { Feature } from "@src/Enum";

export class Migrator {
    constructor(private config: SettingsType, private dispatcher: EventDispatcherInterface<AppEvents>) {}

    public migrate(version: string): SettingsType {
        if (this.config.version === version) {
            return this.config;
        }
        const currentVersion = this.config.version;
        const versions = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(e => e.startsWith("v"))
            .map(e => e.replace("v", "").replaceAll("_", "."))
            .filter(e => PluginHelper.compareVersion(e, ">", currentVersion))
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
            console.log(`Migrate from ${currentVersion} to ${version} by ${method}`);
            //@ts-ignore
            this[method]();
        }
        // this.dispatcher.dispatch("migrator:migrated", new Event({ from: currentVersion, to: version }));
        return this.config;
    }
    private v3_8_0(): void {
        const features = Object.values(Feature);
        delete this.config.features['explorer:sort'];
        for (const [k, v] of Object.entries(this.config.templates)) {
            if (features.contains(k)) {
                this.config.features[k].templates = v;
                delete this.config.templates[k];
            }
        }
        return;
    }
}
