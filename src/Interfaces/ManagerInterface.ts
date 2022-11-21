import { Feature } from "@src/enum";
import FeatureInterface from "@src/Interfaces/FeatureInterface";

export default interface ManagerInterface extends FeatureInterface<Feature> {
    update(path?: string | null): Promise<boolean>;
}
