import { browser, $, expect } from "@wdio/globals";

async function explorerTitles(): Promise<string[]> {
    return browser.execute(() =>
        Array.from(document.querySelectorAll(".nav-file-title-content")).map(e => e.textContent ?? "")
    );
}

describe("Front Matter Title — Explorer updates (#250, #245)", function () {
    // T3 — #245: starting on a non-Files view must still apply titles once the
    // explorer is opened.
    it("applies titles when the explorer is opened after starting elsewhere (#245)", async function () {
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("global-search:open"));
        await browser.pause(4500); // let features activate while NOT on the explorer
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("file-explorer:open"));
        await $(".nav-files-container").then(el => el.waitForExist({ timeout: 20000 }));

        await browser.waitUntil(async () => (await explorerTitles()).some(t => t.includes("Hello From Frontmatter")), {
            timeout: 20000,
            timeoutMsg: "titles not applied when explorer opened after another view (#245)",
        });
    });

    // T2 — #250: CONFIRMED BUG. A newly created file's title is NOT applied in the
    // explorer automatically; it only appears after a feature reload. This test
    // documents the current (buggy) behaviour: basename right after create, title
    // after reload. When #250 is fixed (auto-update on create), the first
    // assertion will start failing — update it to expect the title immediately.
    const RELOAD = "obsidian-front-matter-title-plugin:ofmt-features-reload";
    it("KNOWN #250: new-file title appears only after a reload, not on create", async function () {
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("file-explorer:open"));
        await $(".nav-files-container").then(el => el.waitForExist({ timeout: 20000 }));
        await browser.pause(4500);

        await browser.executeObsidian(async ({ app }) => {
            const existing = (app.vault as any).getAbstractFileByPath("ext-new.md");
            if (existing) await app.vault.delete(existing);
            await app.vault.create("ext-new.md", "---\ntitle: External New Title\n---\n\nbody\n");
        });
        await browser.pause(4000);

        // Current behaviour: not auto-applied (the bug).
        const beforeReload = await explorerTitles();
        expect(beforeReload).toContain("ext-new");
        expect(beforeReload).not.toContain("External New Title");

        // After a reload the plugin does resolve & render it (capability works).
        await browser.executeObsidian((_u, id) => (window as any).app.commands.executeCommandById(id), RELOAD);
        await browser.waitUntil(async () => (await explorerTitles()).some(t => t.includes("External New Title")), {
            timeout: 20000,
            timeoutMsg: "title not applied even after reload",
        });
    });
});
