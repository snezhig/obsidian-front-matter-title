export default interface ManagerFeatureInterface {
    refresh(): Promise<{ [k: string]: boolean }>;

    update(path: string): Promise<boolean>;
}
