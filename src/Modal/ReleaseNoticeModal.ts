import { App, Component, MarkdownRenderer, Modal } from "obsidian";

// Injected by esbuild (see utils/esbuild.config.mjs): the CHANGELOG.md section for
// the current version, so the notice is specific to each release.
declare const PLUGIN_WHATS_NEW: string;

const ISSUES_URL = "https://github.com/snezhig/obsidian-front-matter-title/issues";

/**
 * Shown once after the plugin is updated to a new version: the changes for that
 * version (from CHANGELOG.md) plus a short note about the project's status.
 */
export default class ReleaseNoticeModal extends Modal {
    private readonly component = new Component();

    constructor(app: App, private version: string) {
        super(app);
    }

    onOpen(): void {
        const { contentEl, titleEl } = this;
        titleEl.setText(`What's new in Front Matter Title ${this.version}`);

        const whatsNew = typeof PLUGIN_WHATS_NEW === "string" ? PLUGIN_WHATS_NEW.trim() : "";
        this.component.load();
        const body = contentEl.createDiv();
        MarkdownRenderer.render(this.app, whatsNew || `Updated to ${this.version}.`, body, "", this.component);

        contentEl.createEl("hr");
        contentEl.createEl("p", {
            text:
                "This plugin is back to a working state and is maintained based on demand from the " +
                "community. If there's a feature you need or a bug that matters to you, please open an " +
                "issue on GitHub — that's how priorities get set.",
        });

        const buttons = contentEl.createDiv({ cls: "modal-button-container" });
        const issues = buttons.createEl("button", { text: "Open an issue on GitHub", cls: "mod-cta" });
        issues.addEventListener("click", () => window.open(ISSUES_URL));
        const close = buttons.createEl("button", { text: "Close" });
        close.addEventListener("click", () => this.close());
    }

    onClose(): void {
        this.component.unload();
        this.contentEl.empty();
    }
}
