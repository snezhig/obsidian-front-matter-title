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

    // #280 — repro: a theme/snippet that sets `display` on `.inline-title`
    // (very common) un-hides the original title when it is hidden via the
    // `hidden` attribute, because `[hidden]{display:none}` is a low-priority UA
    // rule. The plugin now hides the original with an important inline style,
    // which wins the cascade against any author rule — so the filename stays
    // hidden even under such a theme. With the old code this shows two titles.
    it("stays single-titled under a theme that styles .inline-title (#280)", async function () {
        await browser.execute(() => {
            const style = document.createElement("style");
            style.id = "ofmt-e2e-theme";
            style.textContent = ".inline-title { display: flex !important; }";
            document.head.appendChild(style);
        });

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

        expect(visible.length).toBe(1);
        expect(visible[0].text).toContain("Hello From Frontmatter");
        expect(visible[0].text).not.toContain("202208251731");
    });
});
