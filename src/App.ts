import Container from "@config/inversify.config";
import DispatcherInterface from "@src/EventDispatcher/Interfaces/DispatcherInterface";
import {SettingsEvent, SettingsType} from "@src/Settings/SettingsType";
import ObjectHelper from "@src/Utils/ObjectHelper";
import CallbackVoid from "@src/EventDispatcher/CallbackVoid";
import SI from "@config/inversify.types";
import {ResolverEvents} from "@src/Resolver/ResolverType";
import BlackWhiteListInterface from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import Event from "@src/EventDispatcher/Event";
import {AppEvents} from "@src/Types";

export default class App {
    private container = Container;

    constructor() {
        this.bind();
    }

    private bind(): void {
        const dispatcher: DispatcherInterface<SettingsEvent> = this.container.get(SI.dispatcher);
        dispatcher.addListener('settings.changed', new CallbackVoid<SettingsEvent['settings.changed']>(e => this.onSettingsChanged(e.get())))
        dispatcher.addListener('settings.loaded', new CallbackVoid(e => this.init(e.get().settings)))
    }

    private init(settings: SettingsType): void {
    }

    private onSettingsChanged({old, actual}: SettingsEvent['settings.changed']): void {
        const changed = ObjectHelper.compare(old, actual);
        type events = ResolverEvents & AppEvents;
        const queue: { [K in keyof events]?: events[K] } = {};
        if (changed.template) {
            this.container.rebind(SI.template).toConstantValue(actual.template);
            queue['template:changed'] = {new: actual.template, old: old.template};
            queue['resolver.clear'] = {all: true};
        }
        if (changed?.rules?.paths) {
            const list = this.container.get<BlackWhiteListInterface>(SI['component:black_white_list']);
            if (changed.rules.paths?.mode) {
                list.setMode(actual.rules.paths.mode);
            }
            if (changed.rules.paths.values) {
                list.setList(actual.rules.paths.values);
            }
            queue['resolver.clear'] = {all: true};
        }

        const dispatcher = this.container.get<DispatcherInterface<events>>(SI.dispatcher);
        for (const event of Object.keys(queue) as (keyof events)[]) {
            dispatcher.dispatch(event, new Event(queue[event]));
        }
    }
}