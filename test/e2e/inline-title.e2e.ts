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

// #285 — repro: dropping an image into a note creates an attachment file, which
// fires vault "create" and makes the plugin run a targeted update for a path
// that belongs to no markdown view. That update used to garbage-collect every
// fake title element while leaving the original hidden, so the note was left
// with no title at all until a reload. Creating a non-markdown file via the API
// is the same code path as the image drop, without needing real drag & drop.
describe("Front Matter Title — InlineTitle survives attachment creation (#285)", function () {
    const attachment = "pasted-image.png";

    async function visibleTitles(): Promise<string[]> {
        return browser.execute(() => {
            const active = document.querySelector(".workspace-leaf.mod-active");
            if (!active) return [];
            return Array.from(active.querySelectorAll(".inline-title"))
                .filter(e => {
                    const el = e as HTMLElement;
                    const cs = getComputedStyle(el);
                    return el.offsetParent !== null && cs.display !== "none" && cs.visibility !== "hidden";
                })
                .map(e => e.textContent ?? "");
        });
    }

    after(async function () {
        await browser.executeObsidian(async ({ app }, file: string) => {
            const existing = (app.vault as any).getAbstractFileByPath(file);
            if (existing) await app.vault.delete(existing);
        }, attachment);
    });

    it("keeps the note title after a new attachment is created", async function () {
        // Drop the theme rule the #280 case injected, so this runs on the plain path.
        await browser.execute(() => document.getElementById("ofmt-e2e-theme")?.remove());

        await browser.pause(4500); // feature activation gate
        await browser.executeObsidian(({ app }) => app.workspace.openLinkText("202208251731", "", true));

        await browser.waitUntil(async () => (await visibleTitles()).some(t => t.includes("Hello From Frontmatter")), {
            timeout: 20000,
            timeoutMsg: "inline title never appeared before the attachment was created",
        });

        await browser.executeObsidian(async ({ app }, file: string) => {
            const existing = (app.vault as any).getAbstractFileByPath(file);
            if (existing) await app.vault.delete(existing);
            // A 1x1 PNG — content does not matter, only that a non-markdown file
            // is created while the note is open, exactly as an image drop does.
            await app.vault.createBinary(file, new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer);
        }, attachment);

        await browser.pause(3000); // let the "create" update settle

        const titles = await visibleTitles();
        expect(titles.length).toBe(1);
        expect(titles[0]).toContain("Hello From Frontmatter");
        expect(titles[0]).not.toContain("202208251731");
    });
});
