import EventInterface from "./Interfaces/EventInterface";

export default class Event<T> implements EventInterface<T> {
    constructor(private data: T) {}

    get(): T {
        return this.data;
    }

    stop(): void {
        return;
    }
}
