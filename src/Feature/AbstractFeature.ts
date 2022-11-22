import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { injectable } from "inversify";

@injectable()
export default abstract class AbstractFeature<T> implements FeatureInterface<T> {
    static getId(): any {
        throw new Error("Static function 'getId()' is not implemented");
    }

    abstract disable(): void;

    abstract enable(): void;

    abstract getId(): T;

    abstract isEnabled(): boolean;
}
