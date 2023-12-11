import { injectable } from "inversify";
import AbstractFeature from "@src/Feature/AbstractFeature";
import ManagerFeatureInterface from "@src/Interfaces/ManagerFeatureInterface";
import { Feature } from "@src/Enum";
import { ResolverInterface } from "../Resolver/Interfaces";

@injectable()
export default abstract class AbstractManager extends AbstractFeature<Feature> implements ManagerFeatureInterface {
    protected resolver: ResolverInterface;

    disable(): void {
        this.isEnabled() && this.doDisable();
    }

    enable(): void {
        !this.isEnabled() && this.doEnable();
    }

    async update(path: string): Promise<boolean> {
        if (!this.isEnabled()) {
            return false;
        }
        return this.doUpdate(path);
    }

    async refresh(): Promise<{ [k: string]: boolean } | void> {
        if (this.isEnabled()) {
            return this.doRefresh();
        }
    }

    setResolver(resolver: ResolverInterface): void {
        this.resolver = resolver;
    }

    abstract isEnabled(): boolean;

    protected abstract doEnable(): void;

    protected abstract doDisable(): void;

    protected abstract doUpdate(path: string): Promise<boolean>;

    protected abstract doRefresh(): Promise<{ [k: string]: boolean } | void>;
}
