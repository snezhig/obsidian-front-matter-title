import { Feature } from "../Enum";
import { SettingsFeature } from "../Settings/SettingsType";

export type FeatureConfig<T extends Feature> = SettingsFeature[T]