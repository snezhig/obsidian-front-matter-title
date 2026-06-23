import { browser, expect } from "@wdio/globals";

const RELOAD = "obsidian-front-matter-title-plugin:ofmt-features-reload";

// T11 — verify the plugin produces no errors while (re)initialising all features.
// Reload + view switching exercises the same paths as #247 ("TypeError ...
// isVisible") and #232 ("error if explorer not active view at start").
// We hook console.error (the plugin's hardening + .catch(console.error) paths all
// go through it) and assert nothing plugin-related fires.
describe("Front Matter Title — no errors during feature (re)init (#247, #232)", function () {
    it("re-initialises all features cleanly, starting from a non-explorer view", async function () {
        // Install the error collector.
        await browser.execute(() => {
            (window as any).__ofmtErrs = [];
            const orig = console.error.bind(console);
            (window as any).__ofmtOrigErr = orig;
            console.error = (...args: any[]) => {
                try {
                    (window as any).__ofmtErrs.push(args.map(a => (a && a.stack) || String(a)).join(" "));
                } catch {
                    /* ignore */
                }
                orig(...args);
            };
        });

        // #232/#245 path: make a non-explorer view active, then reload features.
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("global-search:open"));
        await browser.pause(500);
        await browser.executeObsidian((_unused, id) => (window as any).app.commands.executeCommandById(id), RELOAD);
        await browser.pause(1500);
        // Now bring the explorer back and reload again.
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("file-explorer:open"));
        await browser.executeObsidian((_unused, id) => (window as any).app.commands.executeCommandById(id), RELOAD);
        await browser.pause(2000);

        const errs: string[] = await browser.execute(() => (window as any).__ofmtErrs ?? []);
        // eslint-disable-next-line no-console
        console.log("INIT ERRS >>>", JSON.stringify(errs.slice(0, 20), null, 2));

        const bad = errs.filter(e => {
            const m = e.toLowerCase();
            return (
                m.includes("front-matter-title") ||
                m.includes("isvisible") ||
                m.includes("cannot read properties") ||
                m.includes("explorerviewundefined") ||
                m.includes("is not a function")
            );
        });
        expect(bad).toEqual([]);
    });
});
