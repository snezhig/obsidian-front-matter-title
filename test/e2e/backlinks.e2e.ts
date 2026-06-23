import { browser, expect } from "@wdio/globals";

// T4 — #240 "Not working in Backlinks". linker.md (title "The Linker Note") links
// to 202208251731.md; opening that file's backlinks pane should list the source
// by its frontmatter title, not its filename. On 1.12.7 this works.
describe("Front Matter Title — Backlinks show title (#240)", function () {
    it("shows the linking note's frontmatter title in the backlinks pane", async function () {
        await browser.pause(4500); // feature activation gate
        await browser.executeObsidian(({ app }) => app.workspace.openLinkText("202208251731", "", true));
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("backlink:open"));

        await browser.waitUntil(
            async () => {
                const titles: string[] = await browser.execute(() => {
                    const pane = document.querySelector(".backlink-pane");
                    if (!pane) return [];
                    return Array.from(pane.querySelectorAll(".tree-item-inner")).map(e => e.textContent ?? "");
                });
                return titles.some(t => t.includes("The Linker Note"));
            },
            { timeout: 20000, timeoutMsg: "backlink pane did not show the source note's title (#240)" }
        );
        expect(true).toBe(true);
    });
});
