import { browser, expect } from "@wdio/globals";

// Regression for #268 — Quick Switcher must not crash when the query contains a
// path/directory. (On 1.12.7 it does not crash; the crash does not reproduce.)
//
// NOTE: title substitution inside the global Quick Switcher does NOT currently
// happen on 1.12.7 — the switcher shows "folder/sub-note", not "Sub Note Title".
// The Suggest feature binds the Chooser class via the editor-suggest prototype
// (main.ts), which appears not to cover the global switcher's chooser anymore.
// That substitution gap is tracked for a Phase 3 fix; this spec guards the
// no-crash behaviour only.
describe("Front Matter Title — Quick Switcher / Suggest (#268)", function () {
    it("does not crash on a path query and still returns matches", async function () {
        await browser.executeObsidian(({ app }) => (app as any).commands.executeCommandById("switcher:open"));

        const input = await browser.$(".prompt-input");
        await input.waitForExist({ timeout: 10000 });
        await input.click();
        await browser.keys([..."folder/sub"]);

        const suggestionTexts = await browser.waitUntil(
            async () => {
                const texts: string[] = await browser.execute(() =>
                    Array.from(document.querySelectorAll(".suggestion-item")).map(e => e.textContent ?? "")
                );
                return texts.length > 0 ? texts : false;
            },
            { timeout: 10000, timeoutMsg: "switcher produced no suggestions (possible crash, #268)" }
        );

        // The path query matched the subfolder note — switcher is functional.
        expect(suggestionTexts.some(t => t.includes("sub-note"))).toBe(true);
    });
});
