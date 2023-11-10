import AbstractManager from "@src/Feature/AbstractManager";

export default class WindowFrameManager extends AbstractManager {
    getId(): Feature {
        return undefined;
    }

    protected doDisable(): void {}

    protected doEnable(): void {}

    protected doRefresh(): Promise<{ [p: string]: boolean } | void> {
        return Promise.resolve(undefined);
    }

    protected doUpdate(path: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    isEnabled(): boolean {
        return false;
    }
}
