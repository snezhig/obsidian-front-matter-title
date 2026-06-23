import { browser, $, expect } from "@wdio/globals";

// Regression for #262 — "Sorting in the file explorer is broken": the report is
// specifically that with the plugin enabled you can only sort by name, and
// sorting by created/modified time stops working. The plugin's title-sort only
// handles alphabetical orders and must fall back to Obsidian's native sort for
// time orders. This test proves time-sort still works with the plugin enabled.
const ROOT = ["202208251731.md", "node-a.md", "node-z.md"];

describe("Front Matter Title — Explorer time sort not broken (#262)", function () {
    it("byModifiedTime orders files by mtime, not by name, with the plugin enabled", async function () {
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("file-explorer:open"));
        await $(".nav-files-container").then(el => el.waitForExist({ timeout: 20000 }));
        // Wait past the plugin's ~3s feature-activation gate.
        await browser.pause(4500);

        // Touch the root files in a non-alphabetical order so mtime order differs
        // from name/title order — makes the assertion discriminating.
        for (const path of ["202208251731.md", "node-z.md", "node-a.md"]) {
            await browser.executeObsidian(async ({ app }, p) => {
                const f = (app.vault as any).getAbstractFileByPath(p);
                await app.vault.append(f, "\n");
            }, path);
            await browser.pause(300);
        }

        // Switch the explorer to modified-time sort and re-sort.
        await browser.executeObsidian(({ app }) => {
            const view: any = app.workspace.getLeavesOfType("file-explorer")[0]?.view;
            view.setSortOrder ? view.setSortOrder("byModifiedTime") : (view.sortOrder = "byModifiedTime");
            view.requestSort();
        });
        await browser.pause(2000);

        // DOM order of the root files (by data-path).
        const domPaths: string[] = await browser.execute(() =>
            Array.from(document.querySelectorAll(".nav-file-title")).map(e => e.getAttribute("data-path") ?? "")
        );
        const order = domPaths.filter(p => ROOT.includes(p));

        // Live mtimes for those files.
        const mtimes: Record<string, number> = await browser.executeObsidian(({ app }, root) => {
            const out: Record<string, number> = {};
            for (const p of root) {
                const f = (app.vault as any).getAbstractFileByPath(p);
                out[p] = f?.stat?.mtime ?? 0;
            }
            return out;
        }, ROOT);

        expect(order.length).toBe(ROOT.length);

        // The DOM order must be monotonic in mtime (ascending or descending) —
        // i.e. sorted by time. If the plugin forced name order, it would not be.
        const seq = order.map(p => mtimes[p]);
        const asc = seq.every((v, i) => i === 0 || seq[i - 1] <= v);
        const desc = seq.every((v, i) => i === 0 || seq[i - 1] >= v);
        expect(asc || desc).toBe(true);

        // And it must differ from the alphabetical/title order we forced apart.
        const nameOrder = [...order].sort();
        expect(order).not.toEqual(nameOrder);
    });
});
