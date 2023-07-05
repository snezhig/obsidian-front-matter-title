import { SettingsFeature, SettingsFeatureCommon, SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import { Feature } from "@src/Enum";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

export type BuildParams<K> = {
    id: K extends keyof SettingsFeature ? K : Feature;
    name: string;
    desc: string;
    settings: K extends keyof SettingsFeature ? SettingsFeature[K] : SettingsFeatureCommon;
    doc: { link: string };
};
export type Context = {
    getContainer: () => HTMLElement;
    getDispatcher: () => EventDispatcherInterface<SettingsEvent>;
    getSettings: () => SettingsType["features"];
};
export default interface FeatureBuildInterface<
    K extends keyof SettingsFeature | SettingsFeatureCommon = SettingsFeatureCommon
> {
    build(options: BuildParams<K>): void;
    setContext(context: Context): void;
}
