import { browser, expect } from "@wdio/globals";

// T1 — #234 "both the filename and the frontmatter title are displayed inline".
// On 1.12.7 the plugin hides the original inline-title (display:none) and shows
// only its own with the frontmatter title — so this asserts a single VISIBLE
// inline title equal to the frontmatter value (the bug would show two).
describe("Front Matter Title — InlineTitle has no duplicate (#234)", function () {
    it("shows exactly one visible inline title = frontmatter title", async function () {
        await browser.pause(4500); // feature activation gate
        await browser.executeObsidian(({ app }) => app.workspace.openLinkText("202208251731", "", true));

        const visible = await browser.waitUntil(
            async () => {
                const titles: { text: string; visible: boolean }[] = await browser.execute(() => {
                    const active = document.querySelector(".workspace-leaf.mod-active");
                    if (!active) return [];
                    return Array.from(active.querySelectorAll(".inline-title")).map(e => {
                        const el = e as HTMLElement;
                        const cs = getComputedStyle(el);
                        return {
                            text: el.textContent ?? "",
                            visible: el.offsetParent !== null && cs.display !== "none" && cs.visibility !== "hidden",
                        };
                    });
                });
                const vis = titles.filter(t => t.visible);
                return vis.length > 0 ? vis : false;
            },
            { timeout: 20000, timeoutMsg: "no visible inline title rendered" }
        );

        // Exactly one visible inline title, and it is the frontmatter title.
        expect(visible.length).toBe(1);
        expect(visible[0].text).toContain("Hello From Frontmatter");
        expect(visible[0].text).not.toContain("202208251731");
    });
});
