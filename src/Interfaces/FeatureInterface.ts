export default interface FeatureInterface<T> {
    enable(): Promise<void>;

    disable(): Promise<void>

    getId(): T;

    isEnabled(): boolean;
}