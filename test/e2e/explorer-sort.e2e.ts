import { browser, $, expect } from "@wdio/globals";

// Regression for #262 — Explorer sort by frontmatter title.
// Fixture filenames sort node-a < node-z, but their titles are Zebra / Apple,
// so a working title-sort must put node-z (Apple) before node-a (Zebra) — an
// order impossible under plain filename sorting.
//
// Note: the title-sort settles ~1s after load (the re-sort is debounced), so we
// poll the order until it reflects titles rather than checking it immediately.
describe("Front Matter Title — Explorer sort by title (#262)", function () {
    it("orders files by their frontmatter title, not their filename", async function () {
        await browser.executeObsidianCommand("file-explorer:open");
        const explorer = await $(".nav-files-container");
        await explorer.waitForExist({ timeout: 20000 });

        await browser.waitUntil(
            async () => {
                const texts: string[] = await browser.execute(() =>
                    Array.from(document.querySelectorAll(".nav-file-title-content")).map(e => e.textContent ?? "")
                );
                const apple = texts.indexOf("Apple Title"); // node-z.md
                const zebra = texts.indexOf("Zebra Title"); // node-a.md
                // Both rendered AND ordered by title (Apple before Zebra).
                return apple >= 0 && zebra >= 0 && apple < zebra;
            },
            { timeout: 20000, timeoutMsg: "explorer never settled into title order (#262)" }
        );
    });
});
