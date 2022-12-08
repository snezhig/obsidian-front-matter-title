import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";
import ListenerInterface from "@src/Interfaces/ListenerInterface";
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import ResolverStorageInterface from "./Interface/ResolverStorageInterface";
import { ResolverEvents } from "./ResolverType";

export default class ResolverListener implements ListenerInterface {
    private ref: ListenerRef<"resolver:delete"> = null;
    constructor(
        private storage: ResolverStorageInterface,
        private resolver: ResolverInterface,
        private dispatcher: EventDispatcherInterface<ResolverEvents>
    ) {}

    bind(): void {
        this.ref = this.dispatcher.addListener({ name: "resolver:delete", cb: this.handleDelete.bind(this) });
    }

    unbind(): void {
        this.dispatcher.removeListener(this.ref);
        this.ref = null;
    }

    private handleDelete(e: EventInterface<ResolverEvents["resolver:delete"]>): void {
        const old = this.storage.get(e.get().path);
        const actual = this.resolver.resolve(e.get().path);
        if (old !== actual) {
            this.dispatcher.dispatch("resolver.unresolved", null);
        }
    }
}
