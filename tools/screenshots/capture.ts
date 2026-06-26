import { browser, $ } from "@wdio/globals";
import * as path from "path";

/**
 * Documentation screenshot generator — NOT a test.
 *
 * Drives a real, headless Obsidian (via wdio-obsidian-service) and saves
 * before/after PNGs into docs/img/ for the docs. It is driven by the WebdriverIO
 * runner only as a convenience (it reuses the proven Obsidian harness); it makes
 * no assertions and is never part of `npm run test:e2e`.
 *
 *   OFF state: the plugin's "Disable features" command (titles -> filenames).
 *   ON  state: the plugin's "Reload features" command (titles from frontmatter).
 *
 * Each view is an independent block so a single fragile capture (graph, canvas…)
 * fails in isolation. Window Frame is intentionally skipped: it lives in the OS
 * title bar, which a renderer screenshot cannot capture.
 *
 * Run (always inside Docker, never on the host):
 *   ./dnode-e2e.sh npm run shots
 */

const PLUGIN_ID = "obsidian-front-matter-title-plugin";
const OUT = path.resolve("docs/img");
const ACTIVATION = 5000; // bind() activation gate, see E2E_TEST_PLAN.md

const cmd = (id: string) => browser.executeObsidian(({ app }, c) => (app as any).commands.executeCommandById(c), id);
const disableFeatures = async () => {
    await cmd(`${PLUGIN_ID}:ofmt-features-stop`);
    await browser.pause(1500);
};
const reloadFeatures = async () => {
    await cmd(`${PLUGIN_ID}:ofmt-features-reload`);
    await browser.pause(1500);
};

// Flip the Explorer "sort by title" setting in the live plugin storage (call
// reloadFeatures() afterwards to apply). Lets us show the basic Explorer change
// without reordering, and demonstrate sorting separately — without touching the
// seeded vault data.json (which the e2e tests rely on).
const setSort = (on: boolean) =>
    browser.executeObsidian(
        ({ app }, id, val) => {
            const p = (app as any).plugins.plugins[id];
            p?.storage?.get("features")?.get("explorer")?.get("sort")?.set(val);
        },
        PLUGIN_ID,
        on
    );

const openFile = (p: string) =>
    browser.executeObsidian(async ({ app }, file) => {
        const f = (app as any).vault.getAbstractFileByPath(file);
        if (f) await app.workspace.getLeaf(false).openFile(f);
    }, p);

const domHas = async (selector: string, text: string): Promise<boolean> =>
    browser.execute((sel, t) => (document.querySelector(sel)?.textContent ?? "").includes(t), selector, text);

const waitForText = (selector: string, text: string) =>
    browser.waitUntil(async () => domHas(selector, text), {
        timeout: 20000,
        timeoutMsg: `"${text}" never appeared in ${selector}`,
    });

const shotEl = async (selector: string, name: string) => {
    const el = await $(selector);
    await el.waitForExist({ timeout: 20000 });
    const size = await el.getSize();
    if (!size.width || !size.height) {
        // eslint-disable-next-line no-console
        console.warn(`[shots] skip ${name}: ${selector} has 0 size`);
        return;
    }
    await el.saveScreenshot(path.join(OUT, name));
};

/**
 * Spotlight the changed element inside `container`: draw a ring around the first
 * item (matching `itemSel` + `text`) and dim everything else via a huge outer
 * box-shadow clipped to the container. Captured as part of the screenshot.
 */
const highlight = (container: string, itemSel: string, text: string) =>
    browser.execute(
        (cSel, iSel, t) => {
            const c = document.querySelector(cSel) as HTMLElement | null;
            if (!c) return;
            const items = Array.from(c.querySelectorAll(iSel)) as HTMLElement[];
            const target = items.find(e => (e.textContent ?? "").includes(t)) ?? items[0];
            if (!target) return;
            const cr = c.getBoundingClientRect();
            const tr = target.getBoundingClientRect();
            const pad = 4;
            const ring = document.createElement("div");
            ring.setAttribute("data-ofmt-shot", "1");
            Object.assign(ring.style, {
                position: "absolute",
                left: `${tr.left - cr.left + c.scrollLeft - pad}px`,
                top: `${tr.top - cr.top + c.scrollTop - pad}px`,
                width: `${tr.width + pad * 2}px`,
                height: `${tr.height + pad * 2}px`,
                border: "2px solid #e8b339",
                borderRadius: "6px",
                boxShadow: "0 0 0 9999px rgba(12,14,20,0.5)",
                pointerEvents: "none",
                zIndex: "9999",
                boxSizing: "border-box",
            } as CSSStyleDeclaration);
            if (getComputedStyle(c).position === "static") c.style.position = "relative";
            c.style.overflow = "hidden";
            c.appendChild(ring);
        },
        container,
        itemSel,
        text
    );

const clearHighlight = () =>
    browser.execute(() => document.querySelectorAll("[data-ofmt-shot]").forEach(e => e.remove()));

/** Capture the ON state with a spotlight on the changed item. */
const shotHighlighted = async (container: string, itemSel: string, text: string, name: string) => {
    await highlight(container, itemSel, text);
    await shotEl(container, name);
    await clearHighlight();
};

describe("Front Matter Title — documentation screenshots", function () {
    before(async function () {
        await browser.pause(ACTIVATION);
        try {
            await (browser as any).setWindowSize(1280, 1024);
        } catch {
            /* window sizing is best-effort under Xvfb */
        }
    });

    it("Explorer", async function () {
        await cmd("file-explorer:open");
        await disableFeatures();
        await shotEl(".nav-files-container", "Explorer Off.png");

        // Sort OFF so files keep filename order — the highlighted row then lines
        // up with the same file in the Off shot, so the only visible change is
        // the rename (filename -> title), not a reorder.
        await setSort(false);
        await reloadFeatures();
        await waitForText(".nav-files-container", "Hello From Frontmatter");
        // Clean (un-dimmed) ON capture for the README before/after hero. Consumed
        // and deleted by frame.mjs; kept out of the framed NAMES list.
        await shotEl(".nav-files-container", ".hero-on.png");
        await shotHighlighted(
            ".nav-files-container",
            ".nav-file-title-content",
            "Hello From Frontmatter",
            "Explorer On.png"
        );
    });

    it("Explorer Sort", async function () {
        // Both states show titles; the only difference is order. Off keeps
        // filename order, On is sorted by the displayed title.
        await cmd("file-explorer:open");
        await setSort(false);
        await reloadFeatures();
        await waitForText(".nav-files-container", "Hello From Frontmatter");
        await shotEl(".nav-files-container", "ExplorerSort Off.png");

        await setSort(true);
        await reloadFeatures();
        await waitForText(".nav-files-container", "Apple Title");
        await browser.pause(1200); // let the explorer re-order settle
        await shotEl(".nav-files-container", "ExplorerSort On.png");
        await setSort(false);
    });

    it("Search", async function () {
        const type = () =>
            browser.execute(() => {
                const input = document.querySelector(
                    ".workspace-leaf-content[data-type='search'] .search-input-container input"
                ) as HTMLInputElement | null;
                if (input) {
                    input.value = "note";
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                }
            });

        await disableFeatures();
        await cmd("global-search:open");
        await $(".workspace-leaf-content[data-type='search']").waitForExist({ timeout: 20000 });
        await type();
        await browser.pause(2000);
        await shotEl(".workspace-leaf-content[data-type='search']", "Search Off.png");

        await reloadFeatures();
        await cmd("global-search:open");
        await type();
        await waitForText(".workspace-leaf-content[data-type='search']", "The Linker Note");
        await shotHighlighted(
            ".workspace-leaf-content[data-type='search']",
            ".tree-item-inner",
            "The Linker Note",
            "Search On.png"
        );
    });

    it("Suggest (quick switcher)", async function () {
        const open = async () => {
            await cmd("switcher:open");
            await $(".prompt").waitForExist({ timeout: 20000 });
            await browser.execute(() => {
                const input = document.querySelector(".prompt input") as HTMLInputElement | null;
                if (input) {
                    input.value = "note";
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                }
            });
            await browser.pause(1500);
        };
        const close = () => browser.keys(["Escape"]);

        await disableFeatures();
        await open();
        await shotEl(".prompt", "Suggest Off 1.png");
        await close();

        await reloadFeatures();
        await open();
        await waitForText(".prompt", "Note");
        await shotHighlighted(".prompt", ".suggestion-title", "The Linker Note", "Suggest On 1.png");
        await close();
    });

    it("Bookmarks", async function () {
        const sel = ".workspace-leaf-content[data-type='bookmarks']";
        // Idempotent: only expand if the group is collapsed (never toggle shut),
        // so the bookmarked file is visible in BOTH states.
        const expandGroup = () =>
            browser.execute(() => {
                const item = Array.from(
                    document.querySelectorAll(".workspace-leaf-content[data-type='bookmarks'] .tree-item")
                ).find(i => (i.querySelector(".tree-item-self")?.textContent ?? "").includes("My Group"));
                if (item && item.classList.contains("is-collapsed")) {
                    (item.querySelector(".tree-item-self") as HTMLElement | null)?.click();
                }
            });

        await disableFeatures();
        await cmd("bookmarks:open");
        await $(sel).waitForExist({ timeout: 20000 });
        await expandGroup();
        await waitForText(sel, "202208251731"); // the bookmarked file (filename) is visible
        await shotEl(sel, "BookmarksOff.png");

        await reloadFeatures();
        await cmd("bookmarks:open");
        await expandGroup();
        await waitForText(sel, "Hello From Frontmatter");
        await shotHighlighted(sel, ".tree-item-inner", "Hello From Frontmatter", "BookmarksOn.png");
    });

    it("Backlink", async function () {
        const openPane = async () => {
            await openFile("202208251731.md");
            await cmd("backlink:open");
            await $(".backlink-pane").waitForExist({ timeout: 20000 });
        };

        await disableFeatures();
        await openPane();
        await browser.pause(1000);
        await shotEl(".backlink-pane", "Backlink Off.png");

        await reloadFeatures();
        await openPane();
        await waitForText(".backlink-pane", "The Linker Note");
        await shotHighlighted(".backlink-pane", ".tree-item-inner", "The Linker Note", "Backlink On.png");
    });

    it("Tabs + Header", async function () {
        // Scope to the main editor split so we don't match collapsed sidebar
        // headers (which are 0-width and can't be screenshotted).
        const TABS = ".workspace-split.mod-root .workspace-tab-header-container";
        // The whole header bar of the ACTIVE leaf. The Header feature hides the
        // original title and appends its own `.view-header-title[data-ofmt]`, so
        // we shoot the bar and wait on that element for the ON state.
        const HEADER = ".workspace-leaf.mod-active .view-header";
        const HEADER_TITLE = `${HEADER} .view-header-title[data-ofmt]`;

        await openFile("202208251731.md");
        await openFile("linker.md");
        // Re-open the zettel so its tab/header is active for the title check.
        await openFile("202208251731.md");

        await disableFeatures();
        await waitForText(HEADER, "202208251731");
        await shotEl(TABS, "Tab Off.png");
        await shotEl(HEADER, "Heading Off.png");

        await reloadFeatures();
        await waitForText(TABS, "Hello From Frontmatter");
        await waitForText(HEADER_TITLE, "Hello From Frontmatter");
        await shotHighlighted(TABS, ".workspace-tab-header-inner-title", "Hello From Frontmatter", "Tab On.png");
        await shotHighlighted(HEADER, ".view-header-title[data-ofmt]", "Hello From Frontmatter", "Heading On.png");
    });

    it("Inline title", async function () {
        // Capture the whole note view (inline title + body) so it's clear the
        // change is the big title at the top of the document — not the tab/header.
        // The Inline feature inserts a visible fake `.inline-title[ofmt-fake-id]`
        // and hides the original `.inline-title[ofmt-original-id]`.
        const VIEW = ".workspace-leaf.mod-active .view-content";
        await openFile("202208251731.md");

        await disableFeatures();
        await waitForText(".inline-title", "202208251731");
        await shotHighlighted(VIEW, ".inline-title", "202208251731", "Inline Off.png");

        await reloadFeatures();
        await waitForText(".inline-title[ofmt-fake-id]", "Hello From Frontmatter");
        await shotHighlighted(VIEW, ".inline-title[ofmt-fake-id]", "Hello From Frontmatter", "Inline On.png");
    });

    it("Graph", async function () {
        const sel = ".workspace-leaf-content[data-type='graph']";

        await disableFeatures();
        await cmd("graph:open");
        await $(sel).waitForExist({ timeout: 20000 });
        await browser.pause(3000);
        await shotEl(sel, "Graph Off.png");

        await reloadFeatures();
        await cmd("graph:open");
        await browser.pause(3000);
        await shotEl(sel, "Graph On.png");
    });

    it("Canvas", async function () {
        const sel = ".workspace-leaf-content[data-type='canvas']";

        await disableFeatures();
        await openFile("board.canvas");
        await $(sel).waitForExist({ timeout: 20000 });
        await browser.pause(2000);
        await shotEl(sel, "Canvas Off.png");

        await reloadFeatures();
        await openFile("board.canvas");
        await browser.pause(2000);
        await waitForText(sel, "Hello From Frontmatter");
        await shotEl(sel, "Canvas On.png");
    });

    it("Window Frame (not capturable — logged only)", async function () {
        await reloadFeatures();
        const title = await browser.execute(() => document.title);
        // eslint-disable-next-line no-console
        console.log("[shots] window/document title with features on =>", title);
        // The OS title bar is outside the renderer; no PNG is produced here.
        // Keep the existing WindowFrameOff/On.png in docs/img.
    });
});
