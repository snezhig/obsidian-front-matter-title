import {Manager} from "@src/enum";

export default interface ManagerInterface {
    enable(): Promise<void>;

    disable(): Promise<void>;

    isEnabled(): boolean;

    getId(): Manager;

    update(path: string|null): Promise<boolean>;
}