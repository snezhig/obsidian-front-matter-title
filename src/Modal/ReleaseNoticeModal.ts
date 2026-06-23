import { App, Modal } from "obsidian";

const ISSUES_URL = "https://github.com/snezhig/obsidian-front-matter-title/issues";

/**
 * Shown once after the plugin is updated to a new version: a short "what's new"
 * note plus a message about the plugin's maintenance status.
 */
export default class ReleaseNoticeModal extends Modal {
    constructor(app: App, private version: string) {
        super(app);
    }

    onOpen(): void {
        const { contentEl, titleEl } = this;
        titleEl.setText(`Front Matter Title — back in action (${this.version})`);

        contentEl.createEl("p", {
            text: "Good news: this plugin has been updated to work with the current version of Obsidian again.",
        });

        contentEl.createEl("h3", { text: "Fixed & improved" });
        const list = contentEl.createEl("ul");
        list.createEl("li", {
            text: "Sorting the file explorer by created or modified date works again.",
        });
        list.createEl("li", {
            text:
                "More resilient to Obsidian updates — if a future release changes something internal, " +
                "only the affected feature turns off instead of the whole plugin breaking.",
        });

        contentEl.createEl("h3", { text: "About the future" });
        contentEl.createEl("p", {
            text:
                "This plugin was quiet for a while; it's now back to a healthy, working state. " +
                "Whether it gets active, ongoing development again depends on clear demand from the community. " +
                "If there's a feature you need or a bug that matters to you, please open an issue on GitHub — " +
                "that's how priorities get set.",
        });

        const buttons = contentEl.createDiv({ cls: "modal-button-container" });
        const issues = buttons.createEl("button", { text: "Open an issue on GitHub", cls: "mod-cta" });
        issues.addEventListener("click", () => window.open(ISSUES_URL));
        const close = buttons.createEl("button", { text: "Close" });
        close.addEventListener("click", () => this.close());

        contentEl.createEl("p", { text: "Thanks for using Front Matter Title 🙏" });
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
