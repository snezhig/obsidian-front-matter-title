# Documentation screenshot generator

Regenerates the before/after PNGs in [`docs/img/`](../../docs/img) used by the docs.
This is **tooling, not a test** — it makes no assertions and is not run by
`npm run test:e2e`.

## How it works

[`capture.ts`](./capture.ts) drives a real, headless Obsidian (downloaded by
`wdio-obsidian-service`, rendered under Xvfb) against the fixture vault
[`test/vaults/simple`](../../test/vaults/simple). For each feature it:

1. runs the plugin's **Disable features** command and screenshots the view (filenames) → `* Off.png`;
2. runs **Reload features** and screenshots again (frontmatter titles) → `* On.png`.

It reuses the WebdriverIO runner purely as a convenient launcher for the proven
Obsidian harness. Config: [`wdio.shots.mts`](../../wdio.shots.mts).

## Run

Always inside Docker (never on the host):

```sh
# raw captures only
./dnode-e2e.sh npm run shots

# captures + carbon-style framing (recommended for docs)
./dnode-e2e.sh npm run shots:pretty
```

PNGs are written straight into `docs/img/`. Review the diff before committing.

### Highlighting

ON-state captures spotlight the element that changed: [`capture.ts`](./capture.ts)
draws a ring around the matched item and dims the rest (`shotHighlighted(...)`),
so the title substitution is obvious even in dense panels like Backlinks.

### Framing ([`frame.mjs`](./frame.mjs))

A separate post-processing step (uses `sharp`) wraps each raw screenshot in a
rounded window with a title bar, a soft drop shadow, and a gradient backdrop.
It is **not idempotent** — always frame freshly captured shots, which is why
`shots:pretty` runs `shots` then `frame`. The framed file list lives in
`NAMES` in `frame.mjs`; add new screenshots there too.

## Notes & limitations

- **Window Frame** is not captured — it lives in the OS title bar, outside the
  renderer a screenshot can reach. The existing `WindowFrameOff/On.png` are kept.
- **Alias** has no dedicated panel (it changes the metadata cache), so its
  before/after images are not auto-generated.
- Graph/Canvas rendering depends on timing; if a capture is empty, increase the
  `browser.pause()` for that block.
- To add a feature: add an `it(...)` block that opens the view, waits for a known
  title, and calls `shotEl(selector, "Name On.png")`.
