export default interface FeatureInterface<T> {
    enable(): Promise<void> | void;

    disable(): Promise<void> | void;

    getId(): T;

    isEnabled(): boolean;
}
