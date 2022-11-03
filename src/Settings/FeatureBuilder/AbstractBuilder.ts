import FeatureBuildInterface, {BuildParams} from "@src/Settings/Interface/FeatureBuildInterface";
import {SF, SFC} from "@src/Settings/SettingsType";
import SettingsTab from "@src/Settings/SettingsTab";

export default abstract class AbstractBuilder<K extends keyof SF | SFC = SFC> implements FeatureBuildInterface<K> {
    protected context: SettingsTab;
    setContext(context: SettingsTab): void{
        this.context = context;
    }

    abstract build(options: BuildParams<K>): void;
}
