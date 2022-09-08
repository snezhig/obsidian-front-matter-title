import {App, Modal, Setting} from "obsidian";
import {inject} from "inversify";
import SI from "@config/inversify.types";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import {AppEvents} from "@src/Types";

export default class ChangeApproveModal extends Modal {
    constructor(
        @inject(SI["obsidian:app"])
            app: App,
        @inject(SI.dispatcher)
            dispatcher: DispatcherInterface<AppEvents>
    ) {
        super(app);
    }

    onOpen() {
        this.contentEl.createEl('h4', {text: "Approving file's content changes:"});
        const div = this.contentEl.createDiv()
        this.contentEl.createEl('div', {}, (d) => {
            new Setting(div)
                .addButton(c => c.setButtonText("Approve").setClass('mod-cta')).settingEl.className = ''
            new Setting(div)
                .addButton(c => c.setButtonText("Approve everytime").setClass('mod-cta')).settingEl.className = ''
            new Setting(div)
                .addButton(c => c.setButtonText("Discard").setClass('mod-cta')).settingEl.className = ''

        })
        div.style.display = 'flex'
        div.style.justifyContent = 'space-between'
    }
}