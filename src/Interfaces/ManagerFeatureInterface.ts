export default interface ManagerFeatureInterface {
    refresh(): Promise<{ [k: string]: boolean } | void>;

    update(path: string): Promise<boolean>;
}
