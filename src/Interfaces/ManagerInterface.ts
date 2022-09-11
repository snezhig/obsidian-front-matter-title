import {Manager} from "@src/enum";
import FeatureInterface from "@src/Interfaces/FeatureInterface";

export default interface ManagerInterface extends FeatureInterface<Manager>{

    update(path?: string|null): Promise<boolean>;
}