import { App, Modal, Setting } from "obsidian";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";

@injectable()
export default class ChangeApproveModal {
  private instances: WeakMap<
    Modal,
    {
      path: string;
      changes: [string, string][];
      approve: (approved: boolean) => void;
    }
  > = new Map();
  constructor(
    @inject(SI["obsidian:app"])
    private app: App,
    @inject(SI.dispatcher)
    dispatcher: DispatcherInterface<AppEvents>
  ) {}
  create(path: string, changes: [string, string][], approve: (approved: boolean) => void): Modal {
    const modal = new Modal(this.app);
    modal.onOpen = () => this.onOpen(modal);
    modal.onClose = () => this.approve(modal, false);
    this.instances.set(modal, { path, changes, approve });
    return modal;
  }

  private approve(modal: Modal, approved: boolean): void {
    if (this.instances.has(modal)) {
      this.instances.get(modal).approve(approved);
      this.instances.delete(modal);
    }
  }

  private onOpen(modal: Modal) {
    if (!this.instances.has(modal)) {
      modal.close();
    }
    const { path, changes } = this.instances.get(modal);
    modal.titleEl.setText("Approving file's content changes");

    modal.contentEl.createDiv({}, (d) => {
      const span = d.createDiv().createSpan();
      span.createEl("b", { text: "File path: " });
      span.createSpan({ text: path });
      d.createSpan({ text: "The following links will be replaced:" });
      const ul = d.createEl("ul");
      changes.forEach(([after, before]) => ul.createEl("li").setText(`${before} => ${after}`));
    });

    modal.contentEl.createEl("div", {}, (d) => {
      new Setting(d).addButton((c) =>
        c
          .setButtonText("Approve")
          .setClass("mod-cta")
          .onClick(() => {
            this.approve(modal, true);
            modal.close();
          })
      ).settingEl.className = "";
      new Setting(d).addButton((c) =>
        c
          .setButtonText("Discard")
          .setClass("mod-cta")
          .onClick(() => modal.close())
      ).settingEl.className = "";
      d.style.display = "flex";
      d.style.justifyContent = "space-between";
    });
  }
}
