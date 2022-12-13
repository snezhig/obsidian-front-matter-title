import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { AppEvents } from "@src/Types";
import EventDispatcherInterface from "../EventDispatcher/Interfaces/EventDispatcherInterface";
import ListenerRef from "../EventDispatcher/Interfaces/ListenerRef";
import { ProcessorFactory } from "./ProcessorUtils";

export default class ProcessorListener implements ListenerInterface {
    private ref: ListenerRef<"settings:changed"> = null;
    constructor(private dispatcher: EventDispatcherInterface<AppEvents>, private factory: ProcessorFactory) {}
    bind(): void {
        this.ref = this.dispatcher.addListener({ name: "settings:changed", cb: () => {} });
    }
    unbind(): void {
        this.dispatcher.removeListener(this.ref);
        this.ref = null;
    }
}
