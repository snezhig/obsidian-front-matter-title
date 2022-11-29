import ListenerInterface from "@src/Interfaces/ListenerInterface";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import BlackWhiteListInterface from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { SettingsEvent } from "@src/Settings/SettingsType";
import ListenerRef from "@src/Components/EventDispatcher/Interfaces/ListenerRef";

@injectable()
export default class BlackWhiteListListener implements ListenerInterface {
    private ref: ListenerRef<"settings:changed"> = null;

    constructor(
        @inject(SI["component:black_white_list"])
        private component: BlackWhiteListInterface,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<SettingsEvent>
    ) {}

    bind(): void {
        this.ref = this.dispatcher.addListener({ name: "settings:changed", cb: e => this.handle(e.get()) });
        this.dispatcher.addListener({
            name: "settings.loaded",
            once: true,
            cb: e => {
                this.component.setMode(e.get().settings.rules.paths.mode);
                this.component.setList(e.get().settings.rules.paths.values);
            },
        });
    }

    private handle({ changed, actual }: SettingsEvent["settings:changed"]): void {
        if (changed?.rules?.paths?.values) {
            this.component.setList(actual.rules.paths.values);
        }
        if (changed?.rules?.paths?.mode) {
            this.component.setMode(actual.rules.paths.mode);
        }
    }

    unbind(): void {
        this.dispatcher.removeListener(this.ref);
        this.ref = null;
    }
}
