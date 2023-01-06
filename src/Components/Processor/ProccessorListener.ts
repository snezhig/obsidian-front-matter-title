import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import { SettingsType } from "@src/Settings/SettingsType";
import { AppEvents } from "@src/Types";
import EventDispatcherInterface from "../EventDispatcher/Interfaces/EventDispatcherInterface";
import EventInterface from "../EventDispatcher/Interfaces/EventInterface";
import ListenerRef from "../EventDispatcher/Interfaces/ListenerRef";
import { ProcessorFactory, ProcessorTypes } from "./ProcessorUtils";
import ProcessorInterface from "./Interfaces";
import { inject, injectable } from "inversify";
import SI from "../../../config/inversify.types";
@injectable()
export default class ProcessorListener implements ListenerInterface {
    private changedRef: ListenerRef<"settings:changed"> = null;
    private resolvedRef: ListenerRef<"resolver:resolved"> = null;

    private processor: ProcessorInterface = null;
    constructor(
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents & ResolverEvents>,
        @inject(SI["factory:processor"])
        private factory: ProcessorFactory
    ) {}
    bind(): void {
        this.changedRef = this.dispatcher.addListener({ name: "settings:changed", cb: e => this.make(e.get().actual) });
        this.dispatcher.addListener({ name: "settings.loaded", cb: e => this.make(e.get().settings), once: true });
    }

    unbind(): void {
        this.dispatcher.removeListener(this.changedRef);
        this.changedRef = null;
        this.disable();
    }

    private make(actual: SettingsType): void {
        const { type, args } = actual.processor;
        if (Object.values(ProcessorTypes).includes(type)) {
            this.enable(type, args);
        } else {
            this.disable();
        }
    }

    private disable(): void {
        if (this.resolvedRef) {
            this.dispatcher.removeListener(this.resolvedRef);
            this.resolvedRef = null;
        }
        this.processor = null;
    }

    private enable(type: ProcessorTypes, args: string[]): void {
        this.processor = this.factory(type, args);
        if (this.resolvedRef === null) {
            this.resolvedRef = this.dispatcher.addListener({
                name: "resolver:resolved",
                cb: this.handleResolved.bind(this),
            });
        }
    }

    private handleResolved(event: EventInterface<ResolverEvents["resolver:resolved"]>): void {
        const obj = event.get();
        if (typeof obj.value !== "string") {
            return;
        }
        const value = this.processor?.process(obj.value) ?? null;
        if (value) {
            obj.modify(value);
        }
    }
}
