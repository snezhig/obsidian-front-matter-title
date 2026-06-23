import { browser, expect } from "@wdio/globals";

// Verifies the "what's new" modal that appears once after the plugin is updated.
// Loads a vault whose stored plugin version (3.13.1) differs from the current
// build, so the update is detected and the notice should open.
describe("Front Matter Title — update notice modal", function () {
    it("shows the what's-new modal after a version change", async function () {
        await browser.reloadObsidian({ vault: "test/vaults/update" });

        const text = await browser.waitUntil(
            async () => {
                const t: string = await browser.execute(() => {
                    const m = document.querySelector(".modal-container .modal");
                    return m ? (m.textContent ?? "") : "";
                });
                return t.includes("back in action") ? t : false;
            },
            { timeout: 20000, timeoutMsg: "the update notice modal did not appear" }
        );

        expect(text).toContain("4.0.0");
        expect(text.toLowerCase()).toContain("community");
    });
});
