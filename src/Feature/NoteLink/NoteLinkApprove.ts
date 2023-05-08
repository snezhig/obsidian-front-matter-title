import { inject, injectable } from "inversify";
import SI from "../../../config/inversify.types";
import { NoteLinkChange } from "./NoteLinkTypes";
import { Modal } from "obsidian";

@injectable()
export default class NoteLinkApprove {
    constructor(
        @inject(SI["factory:obsidian:modal"])
        private factory: () => Modal
    ) {}

    public async request(path: string, changes: NoteLinkChange[]): Promise<boolean> {
        return new Promise<boolean>(r => {
            const modal = this.factory();
            let approved = false;
            modal.onClose = () => r(approved);
            const { contentEl } = modal;
            contentEl.setText(`Approve changes for ${path}`);
            contentEl.createEl("ul", null, ul =>
                changes.forEach(e => ul.createEl("li", { text: `${e.original} => ${e.replace}` }))
            );
            const btnContainer = contentEl.createDiv("modal-button-container");
            btnContainer.createEl("button", { cls: "mod-cta", text: "Apply" }).addEventListener("click", () => {
                approved = true;
                modal.close();
            });
            btnContainer.createEl("button", { text: "Cancel" }).addEventListener("click", () => modal.close());
            modal.open();
        });
    }
}
