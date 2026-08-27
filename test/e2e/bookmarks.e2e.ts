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

        // Expand the group so the nested file item renders. The group can already
        // be expanded when the pane restores its state, and a blind click would
        // then collapse it and hide the file — that race is what made this test
        // flaky. Click only while it is actually collapsed, and stop as soon as
        // the title shows up.
        await browser.waitUntil(
            async () =>
                browser.execute(() => {
                    const pane = document.querySelector(".workspace-leaf-content[data-type='bookmarks']");
                    if (!pane) return false;
                    if ((pane.textContent ?? "").includes("Hello From Frontmatter")) return true;
                    const group = Array.from(pane.querySelectorAll(".tree-item")).find(e =>
                        (e.querySelector(".tree-item-self")?.textContent ?? "").includes("My Group")
                    );
                    if (group?.classList.contains("is-collapsed")) {
                        (group.querySelector(".tree-item-self") as HTMLElement | null)?.click();
                    }
                    return false;
                }),
            { timeout: 20000, timeoutMsg: "bookmarked file inside a group did not show its title (#257)" }
        );
        expect(true).toBe(true);
    });
});
