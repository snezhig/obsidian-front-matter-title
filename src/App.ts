import Container from "@config/inversify.config";
import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import SI from "@config/inversify.types";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import { AppEvents } from "@src/Types";
import LoggerComposer from "@src/Components/Debug/LoggerComposer";
import { injectable } from "inversify";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

@injectable()
export default class App {
    private container = Container;

    constructor() {
        this.bind();
    }

    private bind(): void {
        const dispatcher: EventDispatcherInterface<SettingsEvent> = this.container.get(SI["event:dispatcher"]);
        dispatcher.addListener({
            name: "settings:changed",
            cb: e => this.onSettingsChanged(e.get()),
        });
        dispatcher.addListener({
            name: "settings.loaded",
            once: true,
            cb: e => this.init(e.get().settings),
        });
    }

    private init(settings: SettingsType): void {
        this.container.bind(SI.templates).toConstantValue(settings.templates);
        this.container.bind(SI.delimiter).toConstantValue(settings.rules.delimiter);
        this.container.get<LoggerComposer>(SI["logger:composer"])[settings.debug ? "enable" : "disable"]();
    }

    private onSettingsChanged({ actual, changed }: SettingsEvent["settings:changed"]): void {
        type events = ResolverEvents & AppEvents;

        if (changed.templates) {
            this.container.rebind(SI.templates).toConstantValue(actual.templates);
        }

        if (changed?.rules?.delimiter) {
            this.container.rebind(SI.delimiter).toConstantValue(actual.rules.delimiter);
        }

        if (changed.debug) {
            this.container.get<LoggerComposer>(SI["logger:composer"])[actual.debug ? "enable" : "disable"]();
        }

        const dispatcher = this.container.get<EventDispatcherInterface<events>>(SI["event:dispatcher"]);
        dispatcher.dispatch("resolver:clear", null);
    }
}
