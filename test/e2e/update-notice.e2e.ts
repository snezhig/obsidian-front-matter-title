import { browser, expect } from "@wdio/globals";
import * as fs from "fs";

// Verifies the "what's new" modal that appears once after the plugin is updated.
// The vault stores an old plugin version (3.13.1) that differs from the current
// build, so the update is detected. Whether the modal should appear depends on
// the build: the modal is shown only for versions that have a CHANGELOG section
// (same source esbuild injects). Technical/maintenance patches without notes
// show nothing — so this test reads the current version + its CHANGELOG section
// and asserts the matching behavior, staying correct across version bumps.
function changelogSection(version: string): string {
    const lines = fs.readFileSync("CHANGELOG.md", "utf-8").split(/\r?\n/);
    const out: string[] = [];
    let capture = false;
    for (const line of lines) {
        if (line.startsWith("## ")) {
            capture = line.slice(3).trim() === version;
            continue;
        }
        if (capture) out.push(line);
    }
    return out.join("\n").trim();
}

const version: string = JSON.parse(fs.readFileSync("manifest.json", "utf-8")).version;
const notes = changelogSection(version);

describe("Front Matter Title — update notice modal", function () {
    async function modalText(): Promise<string> {
        return browser.execute(() => {
            const m = document.querySelector(".modal-container .modal");
            return m ? m.textContent ?? "" : "";
        });
    }

    if (notes) {
        it(`shows the what's-new modal after a version change (${version})`, async function () {
            await browser.reloadObsidian({ vault: "test/vaults/update" });

            const text = await browser.waitUntil(
                async () => {
                    const t = await modalText();
                    return t.includes("What's new in Front Matter Title") ? t : false;
                },
                { timeout: 20000, timeoutMsg: "the update notice modal did not appear" }
            );

            // Title carries the version; the body is rendered from the CHANGELOG section.
            expect(text).toContain(version);
        });
    } else {
        it(`does not show the what's-new modal for a release without notes (${version})`, async function () {
            await browser.reloadObsidian({ vault: "test/vaults/update" });
            // Give the plugin time to boot and (not) open the modal.
            await browser.pause(3000);
            expect(await modalText()).not.toContain("What's new in Front Matter Title");
        });
    }
});
