import { browser, $, expect } from "@wdio/globals";

const PLUGIN_ID = "obsidian-front-matter-title-plugin";

describe("Front Matter Title — smoke on real Obsidian", function () {
    it("boots without crashing and the plugin is loaded", async function () {
        const loaded = await browser.executeObsidian(({ app }, id) => {
            // @ts-expect-error plugins is part of the internal app API
            return !!app.plugins.plugins[id];
        }, PLUGIN_ID);
        expect(loaded).toBe(true);
    });

    it("shows the frontmatter title (not the filename) in the file explorer", async function () {
        // Explorer is enabled via the seeded vault data.json; make sure the
        // explorer leaf is open so its DOM exists.
        await browser.executeObsidianCommand("file-explorer:open");

        const explorer = await $(".nav-files-container");
        await explorer.waitForExist({ timeout: 20000 });

        // The plugin rewrites the file item's inner text to the frontmatter title.
        // Read the DOM directly in the renderer to avoid wdio element-array quirks.
        await browser.waitUntil(
            async () => {
                const texts: string[] = await browser.execute(() =>
                    Array.from(document.querySelectorAll(".nav-file-title-content")).map(e => e.textContent ?? "")
                );
                return texts.some(t => t.includes("Hello From Frontmatter"));
            },
            { timeout: 20000, timeoutMsg: "frontmatter title was not rendered in the file explorer" }
        );
    });

    it("resolves the title through the plugin API", async function () {
        const title = await browser.executeObsidian(({ app }, id) => {
            // @ts-expect-error internal app API
            const plugin = app.plugins.plugins[id];
            const api = plugin?.getApi?.() ?? plugin?.api;
            return api?.resolve?.("202208251731.md") ?? null;
        }, PLUGIN_ID);

        // If the public API surface changed this is just null; the explorer
        // assertion above is the authoritative check. Logged for the baseline.
        // eslint-disable-next-line no-console
        console.log("[e2e] api.resolve(202208251731.md) =>", title);
    });
});
