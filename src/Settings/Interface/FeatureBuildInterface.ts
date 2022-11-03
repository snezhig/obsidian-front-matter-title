import {SF, SFC} from "@src/Settings/SettingsType";
import {Feature} from "@src/enum";
import SettingsTab from "@src/Settings/SettingsTab";

export type BuildParams<K> = {
    id: K extends keyof SF ? K : Feature,
    name: string,
    desc: string,
    settings: K extends keyof SF ? SF[K] : SFC
}
export default interface FeatureBuildInterface<K extends keyof SF|SFC = SFC> {
    build(options: BuildParams<K>): void;
    setContext(context: SettingsTab): void;
}