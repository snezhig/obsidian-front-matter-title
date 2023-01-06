import { DynamicItem } from "@src/Storage/Interfaces";

export type BuildParams<T extends object, K extends keyof T> = {
    name: K;
    item: DynamicItem<T[K]>;
    container: HTMLElement;
};

export default interface SettingBuilderInterface<T extends object, K extends keyof T> {
    build(params: BuildParams<T, K>): void;

    support(k: keyof T): boolean;
}
