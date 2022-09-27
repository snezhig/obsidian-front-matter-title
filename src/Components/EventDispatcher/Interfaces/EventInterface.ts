export default interface EventInterface<T> {
    stop(): void;

    get(): T;
}
