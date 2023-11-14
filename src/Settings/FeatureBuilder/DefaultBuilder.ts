import AbstractBuilder from "./AbstractBuilder";
import { injectable } from "inversify";

@injectable()
export default class DefaultBuilder extends AbstractBuilder {
    private extraContainerEl: HTMLElement;
    doBuild() {
        this.buildEnable();
        this.extraContainerEl = this.context.getContainer().createDiv();
        this.addTemplateManageButton();
    }

    protected getExtraSettingContainer(): HTMLElement {
        return this.extraContainerEl;
    }
}
