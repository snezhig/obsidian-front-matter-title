import { SF, SFC, SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import { Feature } from "@src/enum";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

export type BuildParams<K> = {
    id: K extends keyof SF ? K : Feature;
    name: string;
    desc: string;
    settings: K extends keyof SF ? SF[K] : SFC;
};
export type Context = {
    getContainer: () => HTMLElement;
    getDispatcher: () => EventDispatcherInterface<SettingsEvent>;
    getSettings: () => SettingsType["features"];
};
export default interface FeatureBuildInterface<K extends keyof SF | SFC = SFC> {
    build(options: BuildParams<K>): void;
    setContext(context: Context): void;
}
