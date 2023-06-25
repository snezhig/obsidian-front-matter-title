import { inject, injectable } from "inversify";
import { ApiInterface, EventDispatcherInterface, Events, ResolverFactory } from "front-matter-plugin-api-provider";
import FeatureComposer from "../../Feature/FeatureComposer";
import SI from "../../../config/inversify.types";

@injectable()
export default class Api implements ApiInterface {
    constructor(
        @inject(SI["feature:service"])
        private factory: ResolverFactory,
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcherInterface<Events>,
        @inject(SI["feature:composer"])
        private composer: FeatureComposer
    ) {}

    getResolverFactory(): ResolverFactory {
        return this.factory;
    }

    getEventDispatcher(): EventDispatcherInterface<Events> {
        return this.dispatcher;
    }

    getEnabledFeatures(): string[] {
        return this.composer.getIds();
    }
}
