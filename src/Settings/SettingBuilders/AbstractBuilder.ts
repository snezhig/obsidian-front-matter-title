import { injectable } from "inversify";
import SettingBuilderInterface, { BuildParams } from "../Interface/SettingBuilderInterface";
import { DynamicItem } from "@src/Storage/Interfaces";

@injectable()
export default abstract class AbstractBuilder<T extends object, K extends keyof T>
    implements SettingBuilderInterface<T, K>
{
    protected item: DynamicItem<T[K]> = null;
    protected container: HTMLElement = null;
    protected name: K = null;

    build({ name, container, item }: BuildParams<T, K>): void {
        this.name = name;
        this.item = item;
        this.container = container;
        this.doBuild();
    }
    abstract support(k: keyof T): boolean;

    abstract doBuild(): void;
}
