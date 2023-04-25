import { inject, injectable, named } from "inversify";
import { EventDispatcher } from "@src/Components/EventDispatcher/EventDispatcher";
import ListenerInterface from "../../Interfaces/ListenerInterface";
import { AppEvents } from "@src/Types";
import SI from "../../../config/inversify.types";
import ListenerRef from "../../Components/EventDispatcher/Interfaces/ListenerRef";
import EventInterface from "../../Components/EventDispatcher/Interfaces/EventInterface";
import { NoteLinkChange } from "./NoteLinkTypes";
import Event from "../../Components/EventDispatcher/Event";
import { Modal } from "obsidian";
import { FeatureConfig } from "../Types";
import { Feature } from "../../Enum";

@injectable()
export default class NoteLinkApprove implements ListenerInterface {
    private refs: ListenerRef<any>[] = [];
    constructor(
        @inject(SI["event:dispatcher"])
        private dispatcher: EventDispatcher<AppEvents>,
        @inject(SI["factory:obsidian:modal"])
        private factory: () => Modal,
        @inject(SI["feature:config"])
        @named(Feature.NoteLink)
        private config: FeatureConfig<Feature.NoteLink>
    ) {}

    bind(): void {
        this.refs.push(
            this.dispatcher.addListener<"note:link:changes:approve">({
                name: "note:link:changes:approve",
                cb: this.approve.bind(this),
            })
        );
    }

    unbind(): void {
        this.refs.forEach(e => this.dispatcher.removeListener(e));
        this.refs = [];
    }

    private approve(event: EventInterface<AppEvents["note:link:changes:approve"]>): void {
        const { path, changes } = event.get();
        if (this.config.approval === false) {
            return this.dispatchExecute(path, changes);
        }
        const modal = this.factory();
        const { contentEl } = modal;
        contentEl.setText(`Approve changes for ${path}`);
        contentEl.createEl("ul", null, ul =>
            changes.forEach(e => ul.createEl("li", { text: `${e.original} => ${e.replace}` }))
        );
        const btnContainer = contentEl.createDiv("modal-button-container");
        btnContainer.createEl("button", { cls: "mod-cta", text: "Apply" }).addEventListener("click", () => {
            this.dispatchExecute(path, changes);
            modal.close();
        });
        btnContainer.createEl("button", { text: "Cancel" }).addEventListener("click", () => modal.close());
        modal.open();
    }

    private dispatchExecute(path: string, changes: NoteLinkChange[]): void {
        this.dispatcher.dispatch("note:link:changes:execute", new Event({ path, changes }));
    }
}
