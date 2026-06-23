import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import { AppEvents } from "@src/Types";
import Event from "@src/Components/EventDispatcher/Event";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { Notice } from "obsidian";

@injectable()
export default class FeatureComposer {
    private features: { [k: string]: FeatureInterface<any> } = {};

    constructor(
        @inject(SI["factory:feature"])
        private factory: (name: string) => FeatureInterface<any>,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<AppEvents>,
        @inject(SI.logger)
        @named("composer:feature")
        private logger: LoggerInterface
    ) {}

    public get<K extends FeatureInterface<any>>(id: any): K | null {
        return (this.features[id] as K) ?? null;
    }

    public getIds(): string[] {
        return Object.keys(this.features);
    }

    toggle(id: any, state: boolean): void {
        this.logger.log(`Feature - ${id} toggle to ${state}`);
        const feature = this.features[id];
        if ((!state && !feature) || (state && feature?.isEnabled())) {
            return;
        }

        if (!feature) {
            this.features[id] = this.factory(id);
            return this.toggle(id, state);
        }

        // Isolate each feature: enabling one relies on undocumented Obsidian
        // internals that may have drifted; a throw here must not take down the
        // rest of the features or the plugin boot (the "white screen" reports).
        try {
            feature[state ? "enable" : "disable"]();
        } catch (e) {
            this.logger.log(`Feature - ${id} failed to ${state ? "enable" : "disable"}: ${e}`);
            console.error(`[front-matter-title] feature "${id}" failed to ${state ? "enable" : "disable"}`, e);
            if (state) {
                new Notice(
                    `[Front Matter Title] Feature "${id}" was disabled due to an error. See console for details.`
                );
                try {
                    feature.disable();
                } catch (_) {
                    /* best-effort rollback */
                }
                delete this.features[id];
            }
            return;
        }
        this.logger.log(`Feature - ${feature.getId()}. State: ${state}`);
        if (!state) {
            delete this.features[id];
        } else {
            this.dispatcher.dispatch("feature:enable", new Event({ feature }));
        }
    }

    disableAll(): void {
        for (const feature of Object.values(this.features)) {
            this.logger.log(`Disable feature ${feature.getId()}`);
            try {
                feature.disable();
            } catch (e) {
                console.error(`[front-matter-title] feature "${feature.getId()}" failed to disable`, e);
            }
        }
        this.features = {};
    }
}
