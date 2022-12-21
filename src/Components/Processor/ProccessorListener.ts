import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import { SettingsType } from "@src/Settings/SettingsType";
import { AppEvents } from "@src/Types";
import EventDispatcherInterface from "../EventDispatcher/Interfaces/EventDispatcherInterface";
import EventInterface from "../EventDispatcher/Interfaces/EventInterface";
import ListenerRef from "../EventDispatcher/Interfaces/ListenerRef";
import { ProcessorFactory, ProcessorTypes } from "./ProcessorUtils";
import ProcessorInterface from "./Interfaces";

export default class ProcessorListener implements ListenerInterface {
    private changedRef: ListenerRef<"settings:changed"> = null;
    private resolvedRef: ListenerRef<"resolver:resolved"> = null;

    private processor: ProcessorInterface = null;
    constructor(
        private dispatcher: EventDispatcherInterface<AppEvents & ResolverEvents>,
        private factory: ProcessorFactory
    ) {}
    bind(): void {
        this.changedRef = this.dispatcher.addListener({ name: "settings:changed", cb: e => this.make(e.get().actual) });
        this.dispatcher.addListener({ name: "settings.loaded", cb: e => this.make(e.get().settings) });
    }

    unbind(): void {
        this.dispatcher.removeListener(this.changedRef);
        this.changedRef = null;
        this.disable();
    }

    private make(actual: SettingsType): void {
        const options = actual.processor;
        options.type ? this.enable(options.type, options.args) : this.disable();
    }

    private disable(): void {
        if (this.resolvedRef) {
            this.dispatcher.removeListener(this.resolvedRef);
            this.resolvedRef = null;
        }
        this.processor = null;
    }

    private enable(type: ProcessorTypes, args: string[]): void {
        this.resolvedRef = this.dispatcher.addListener({
            name: "resolver:resolved",
            cb: this.handleResolved.bind(this),
        });
        this.processor = this.factory(type, args);
    }

    private handleResolved(event: EventInterface<ResolverEvents["resolver:resolved"]>): void {
        if (this.processor) {
            const { modify, value } = event.get();
            modify(this.processor.process(value));
        }
    }
}
