import { inject, injectable } from "inversify";
import ObsidianFacade from "../../Obsidian/ObsidianFacade";
import { Feature } from "../../enum";
import AbstractManager from "../AbstractManager";
import SI from "../../../config/inversify.types";

@injectable()
export default class BacklingManager extends AbstractManager {
    constructor(
        @inject(SI["facade:obsidian"])
        private facade: ObsidianFacade
    ) {
        super();
    }
    isEnabled(): boolean {
        console.log(this.facade.getViewsOfType("backlink"));
        return false;
    }
    protected doEnable(): void {
        return;
    }
    protected doDisable(): void {
        throw new Error("Method not implemented.");
    }
    protected doUpdate(path: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    protected doRefresh(): Promise<{ [k: string]: boolean }> {
        throw new Error("Method not implemented.");
    }
    getId(): Feature {
        return BacklingManager.getId();
    }
    static getId() {
        return Feature.Backlink;
    }
}
