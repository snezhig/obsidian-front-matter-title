import { browser, expect } from "@wdio/globals";

// #257 — title substitution for files bookmarked INSIDE a group. The fixture
// bookmarks 202208251731.md (title "Hello From Frontmatter") inside "My Group".
describe("Front Matter Title — Bookmarks inside a group (#257)", function () {
    const paneText = async (): Promise<string> =>
        browser.execute(
            () => document.querySelector(".workspace-leaf-content[data-type='bookmarks']")?.textContent ?? ""
        );

    it("substitutes the title for a file bookmarked inside a group", async function () {
        await browser.pause(4500);
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("bookmarks:open"));
        await browser.waitUntil(async () => (await paneText()).includes("My Group"), {
            timeout: 20000,
            timeoutMsg: "bookmarks pane / group never rendered",
        });

        // Expand the group: this renders the nested file item and triggers the
        // plugin to process it (the recursive traversal handles nested files).
        await browser.execute(() => {
            const self = Array.from(
                document.querySelectorAll(".workspace-leaf-content[data-type='bookmarks'] .tree-item-self")
            ).find(e => (e.textContent ?? "").includes("My Group"));
            (self as HTMLElement | undefined)?.click();
        });

        await browser.waitUntil(async () => (await paneText()).includes("Hello From Frontmatter"), {
            timeout: 20000,
            timeoutMsg: "bookmarked file inside a group did not show its title (#257)",
        });
        expect(true).toBe(true);
    });
});
