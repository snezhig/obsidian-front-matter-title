import { SettingsEvent, SettingsFeature } from "@src/Settings/SettingsType";
import { Feature } from "@src/Enum";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

export type BuildSettingConfig<K extends keyof SettingsFeature> = SettingsFeature[K];
export type BuildParams<K extends Feature> = {
    id: K;
    name: string;
    desc: string;
    config: BuildSettingConfig<K>;
    doc: { link: string };
};
export type Context = {
    getContainer: () => HTMLElement;
    getDispatcher: () => EventDispatcherInterface<SettingsEvent>;
    getSettings: () => SettingsFeature;
};
export default interface FeatureBuildInterface<K extends Feature> {
    build(options: BuildParams<K>): void;

    setContext(context: Context): void;
}
