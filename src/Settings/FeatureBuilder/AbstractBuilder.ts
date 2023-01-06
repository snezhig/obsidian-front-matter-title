import FeatureBuildInterface, { BuildParams, Context } from "@src/Settings/Interface/FeatureBuildInterface";
import { SF, SFC } from "@src/Settings/SettingsType";

export default abstract class AbstractBuilder<K extends keyof SF | SFC = SFC> implements FeatureBuildInterface<K> {
    protected context: Context;
    setContext(context: Context): void {
        this.context = context;
    }

    abstract build(options: BuildParams<K>): void;
}
