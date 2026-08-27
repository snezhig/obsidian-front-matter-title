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
        await browser.waitUntil(async () => (await activeTabTitles()).some(t => t.includes("Hello From Frontmatter")), {
            timeout: 20000,
            timeoutMsg: "tab header did not show the frontmatter title (general case)",
        });
    });

    it("shows the frontmatter title when opened from global search in a new tab", async function () {
        // The #277 trigger: a note opened by clicking a global-search result in a
        // NEW tab. Drive the query through the view API — typing into the search
        // box is not reliably interactable headless — but do the navigation with a
        // real click, since that is the code path the issue is about.
        // Make the active file a *different* note, so a tab title that is only
        // refreshed for the active path cannot pass this by coincidence.
        await browser.executeObsidian(({ app }) => app.workspace.openLinkText("linker", "", false));
        await browser.pause(1000);

        const before: string[] = await browser.executeObsidian(({ app }) =>
            (app.workspace as any).getLeavesOfType("markdown").map((l: any) => l.id)
        );

        await browser.executeObsidianCommand("global-search:open");
        await browser.executeObsidian(({ app }) => {
            const view: any = (app.workspace as any).getLeavesOfType("search")[0]?.view;
            view?.setQuery("zettelkasten");
        });

        const selector = ".workspace-leaf-content[data-type='search'] .search-result-file-title";
        await browser.$(selector).then(el => el.waitForExist({ timeout: 20000 }));

        // Mod+click on a search result is what opens it in a new tab. Synthesize the
        // event instead of holding a modifier through the driver — it still goes
        // through Obsidian's own result-click handler, which is the path #277 is about.
        await browser.execute(sel => {
            const el = document.querySelector(sel) as HTMLElement;
            el.dispatchEvent(
                new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true, metaKey: true })
            );
        }, selector);

        const title = await browser.waitUntil(
            async () => {
                const found = await browser.executeObsidian(({ app }, ids: string[]) => {
                    const leaf: any = (app.workspace as any)
                        .getLeavesOfType("markdown")
                        .find((l: any) => !ids.includes(l.id));
                    return leaf?.tabHeaderInnerTitleEl?.textContent ?? null;
                }, before);
                return found || false;
            },
            { timeout: 20000, timeoutMsg: "no new tab was opened from the search result" }
        );

        expect(title).toContain("Hello From Frontmatter");
        expect(title).not.toContain("202208251731");
    });
});
