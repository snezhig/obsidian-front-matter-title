import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import Container from "@config/inversify.config";
import DispatcherInterface from "@src/EventDispatcher/Interfaces/DispatcherInterface";
import {SettingsEvent} from "@src/Settings/SettingsType";
import EventInterface from "@src/EventDispatcher/Interfaces/EventInterface";
import Callback from "@src/EventDispatcher/Callback";
import ObjectHelper from "@src/Utils/ObjectHelper";

export default class App {
    private container = Container;
    private resolvers: {
        [Resolving.Sync]: ResolverInterface
        [Resolving.Async]: ResolverInterface<Resolving.Async>
    } = {};

    private bind(): void {
        const dispatcher: DispatcherInterface<SettingsEvent> = this.container.get(TYPES.dispatcher);
        dispatcher.addListener('settings.changed', new Callback<SettingsEvent['settings.changed']>(this.onSettingsChanged.bind(this)))
    }

    private onSettingsChanged(e: EventInterface<SettingsEvent['settings.changed']>) {
        const changed = ObjectHelper.compare(e.get().old, e.get().actual);
        return e;
    }

    public getResolver<T extends keyof typeof Resolving>(type: T): ResolverInterface<Resolving[T]> {
        return this.resolvers[type];
    }
}
