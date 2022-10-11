import ManagerInterface from "@src/Interfaces/ManagerInterface";
import { Manager } from "@src/enum";

export default abstract class AbstractManager implements ManagerInterface {
    async disable(): Promise<void> {
        if (this.isEnabled()) {
            return this.doDisable();
        }
    }

    async enable(): Promise<void> {
        if (!this.isEnabled()) {
            return this.doEnable();
        }
    }

    async update(path?: string | null): Promise<boolean> {
        if (!this.isEnabled()) {
            return false;
        }
        return this.doUpdate(path);
    }

    abstract getId(): Manager;

    abstract isEnabled(): boolean;

    protected abstract doEnable(): Promise<void>;

    protected abstract doDisable(): Promise<void>;

    protected abstract doUpdate(path?: string | null): Promise<boolean>;
}
