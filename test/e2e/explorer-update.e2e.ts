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

    // T2 — #250: a file created via the API (stand-in for an externally added file)
    // now gets its title rendered in the explorer automatically, without a manual
    // reload (fixed by the vault "create" listener, PR #254).
    it("renders the title for a newly created file automatically (#250)", async function () {
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("file-explorer:open"));
        await $(".nav-files-container").then(el => el.waitForExist({ timeout: 20000 }));
        await browser.pause(4500);

        await browser.executeObsidian(async ({ app }) => {
            const existing = (app.vault as any).getAbstractFileByPath("ext-new.md");
            if (existing) await app.vault.delete(existing);
            await app.vault.create("ext-new.md", "---\ntitle: External New Title\n---\n\nbody\n");
        });

        await browser.waitUntil(async () => (await explorerTitles()).some(t => t.includes("External New Title")), {
            timeout: 20000,
            timeoutMsg: "newly created file did not get its title in the explorer (#250)",
        });
    });
});
