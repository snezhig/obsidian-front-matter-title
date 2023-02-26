import { inject, injectable, named } from "inversify";
import SI from "@config/inversify.types";
import Alias from "@src/Feature/Alias/Alias";
import { StrategyInterface } from "../Interfaces";
import FeatureService from "../../ManagerService";
import { ResolverInterface } from "../../../Resolver/Interfaces";
import { Feature } from "../../../enum";

@injectable()
export default abstract class AbstractStrategy implements StrategyInterface {
    private resolver: ResolverInterface;
    constructor(
        @inject(SI["feature:service"])
        private service: FeatureService
    ) {
        this.resolver = service.createResolver(Feature.Alias);
    }

    process(alias: Alias, path: string): void {
        const title = this.resolver.resolve(path);
        if (title) {
            this.modify(alias, title);
        }
    }

    protected abstract modify(alias: Alias, title: string): void;
}
