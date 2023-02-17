import { Feature } from "@src/enum";

export interface FeatureInfoInterface {
    getName(feature: Feature): string;

    getDescription(feature: Feature): string;
}
