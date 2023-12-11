import AbstractBuilder from "./AbstractBuilder";
import { injectable } from "inversify";
import { Modal } from "obsidian";

@injectable()
export default class DefaultBuilder extends AbstractBuilder {
    doBuild() {
        this.buildEnable();
    }

    protected onModalShow(modal: Modal) {
        this.buildTemplates(modal.contentEl);
    }
}
