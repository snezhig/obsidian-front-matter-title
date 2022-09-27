import Container from "@config/inversify.config";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import ObjectHelper from "@src/Utils/ObjectHelper";
import CallbackVoid from "@src/Components/EventDispatcher/CallbackVoid";
import SI from "@config/inversify.types";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import BlackWhiteListInterface from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import Event from "@src/Components/EventDispatcher/Event";
import { AppEvents } from "@src/Types";
import LoggerComposer from "@src/Components/Debug/LoggerComposer";
import FeatureToggle from "@src/Managers/Features/FeatureToggle";
import { injectable } from "inversify";

@injectable()
export default class App {
    private container = Container;
    private featureToggle: FeatureToggle;
    constructor() {
        this.bind();
    }

    private bind(): void {
        const dispatcher: DispatcherInterface<SettingsEvent> = this.container.get(SI.dispatcher);
        dispatcher.addListener(
            "settings.changed",
            new CallbackVoid<SettingsEvent["settings.changed"]>(e => this.onSettingsChanged(e.get()))
        );
        dispatcher.addListener("settings.loaded", new CallbackVoid(e => this.init(e.get().settings)));
    }

    private init(settings: SettingsType): void {
        this.container.bind(SI.templates).toConstantValue(settings.templates);
        this.container.bind(SI.delimiter).toConstantValue(settings.rules.delimiter);
        this.container
            .get<BlackWhiteListInterface>(SI["component:black_white_list"])
            .setMode(settings.rules.paths.mode);
        this.container
            .get<BlackWhiteListInterface>(SI["component:black_white_list"])
            .setList(settings.rules.paths.values);
        this.container.get<LoggerComposer>(SI["logger:composer"])[settings.debug ? "enable" : "disable"]();
        this.featureToggle = this.container.get<FeatureToggle>(SI.feature_toggle);
    }

    private onSettingsChanged({ old, actual }: SettingsEvent["settings.changed"]): void {
        const changed = ObjectHelper.compare(old, actual);
        type events = ResolverEvents & AppEvents;
        const queue: { [K in keyof events]?: events[K] } = {};
        if (changed.templates) {
            this.container.rebind(SI.templates).toConstantValue(actual.templates);
            queue["templates:changed"] = { new: actual.templates, old: old.templates };
            queue["resolver.clear"] = { all: true };
        }
        if (changed?.rules?.paths) {
            const list = this.container.get<BlackWhiteListInterface>(SI["component:black_white_list"]);
            if (changed.rules.paths?.mode) {
                list.setMode(actual.rules.paths.mode);
            }
            if (changed.rules.paths.values) {
                list.setList(actual.rules.paths.values);
            }
            queue["resolver.clear"] = { all: true };
        }
        if (changed?.rules?.delimiter) {
            this.container.rebind(SI.delimiter).toConstantValue(actual.rules.delimiter);
            queue["resolver.clear"] = { all: true };
        }

        if (changed.debug) {
            this.container.get<LoggerComposer>(SI["logger:composer"])[actual.debug ? "enable" : "disable"]();
        }

        const dispatcher = this.container.get<DispatcherInterface<events>>(SI.dispatcher);
        for (const event of Object.keys(queue) as (keyof events)[]) {
            dispatcher.dispatch(event, new Event(queue[event]));
        }
    }
}
