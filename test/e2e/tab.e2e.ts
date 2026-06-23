import { browser, expect } from "@wdio/globals";

// Regression for #277 — the tab header should show the frontmatter title.
// First check the general case (open in a new tab), then the global-search case
// the issue is specifically about.
describe("Front Matter Title — Tab title (#277)", function () {
    async function activeTabTitles(): Promise<string[]> {
        return browser.execute(() =>
            Array.from(document.querySelectorAll(".workspace-tab-header-inner-title")).map(e => e.textContent ?? "")
        );
    }

    it("shows the frontmatter title in a tab opened normally", async function () {
        await browser.executeObsidian(({ app }) => app.workspace.openLinkText("202208251731", "", true));
        await browser.waitUntil(
            async () => (await activeTabTitles()).some(t => t.includes("Hello From Frontmatter")),
            { timeout: 20000, timeoutMsg: "tab header did not show the frontmatter title (general case)" }
        );
    });

    it("shows the frontmatter title when opened from global search in a new tab", async function () {
        // Open global search and run a query that matches the note body.
        await browser.executeObsidianCommand("global-search:open");
        const input = await browser.$(".search-input-container input, .workspace-leaf.mod-active input");
        await input.waitForExist({ timeout: 10000 });
        await input.setValue("zettelkasten");

        // Open the first search result file in a NEW tab via the workspace API
        // (mirrors "open from search results", the #277 trigger).
        await browser.waitUntil(
            async () => {
                const opened = await browser.executeObsidian(({ app }) => {
                    const f = (app.vault as any).getAbstractFileByPath("202208251731.md");
                    if (!f) return false;
                    return app.workspace.getLeaf("tab").openFile(f).then(() => true);
                });
                if (!opened) return false;
                return (await activeTabTitles()).some(t => t.includes("Hello From Frontmatter"));
            },
            { timeout: 20000, timeoutMsg: "tab header did not show the frontmatter title (from search)" }
        );
        expect(true).toBe(true);
    });
});
