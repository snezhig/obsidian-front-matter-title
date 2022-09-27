import { Feature } from "@src/enum";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { injectable } from "inversify";

@injectable()
export default abstract class BaseFeature implements FeatureInterface<Feature> {
    static id(): Feature {
        throw new Error("Static function 'id()' is not implemented");
    }

    abstract disable(): Promise<void>;

    abstract enable(): Promise<void>;

    abstract getId(): Feature;

    abstract isEnabled(): boolean;
}
