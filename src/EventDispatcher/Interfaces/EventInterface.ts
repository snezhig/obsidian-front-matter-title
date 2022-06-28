export default interface EventInterface<T> {
    stop(): void;

    getData(): T;
}