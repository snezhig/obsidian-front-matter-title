import FeatureBuildInterface, { BuildParams, Context } from "@src/Settings/Interface/FeatureBuildInterface";
import { SettingsFeature, SettingsFeatureCommon } from "@src/Settings/SettingsType";

export default abstract class AbstractBuilder<K extends keyof SettingsFeature | SettingsFeatureCommon = SettingsFeatureCommon> implements FeatureBuildInterface<K> {
    protected context: Context;
    setContext(context: Context): void {
        this.context = context;
    }

    abstract build(options: BuildParams<K>): void;
}
