import { browser, expect } from "@wdio/globals";

// Regression for #268 — Quick Switcher with a path query.
// Baseline on 1.12.7: it does NOT crash, and (once features have activated —
// the plugin gates feature activation behind a ~3s timer after layout-ready)
// the Suggest feature substitutes the frontmatter title into the results.
describe("Front Matter Title — Quick Switcher / Suggest (#268)", function () {
    it("shows the frontmatter title for a path query without crashing", async function () {
        await browser.waitUntil(
            async () => {
                // (Re)open the switcher and type a path-like query each poll, until
                // the Suggest feature has activated and substitutes the title.
                await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("switcher:open"));
                const input = await browser.$(".prompt-input");
                if (!(await input.isExisting())) return false;
                await input.click();
                await browser.keys([..."folder/sub"]);

                const texts: string[] = await browser.execute(() =>
                    Array.from(document.querySelectorAll(".suggestion-item")).map(e => e.textContent ?? "")
                );
                if (texts.some(t => t.includes("Sub Note Title"))) return true;
                // not yet — close the switcher and let the poll retry
                await browser.keys(["Escape"]);
                return false;
            },
            { timeout: 20000, interval: 1500, timeoutMsg: "switcher never substituted the title (#268)" }
        );
        expect(true).toBe(true);
    });
});
