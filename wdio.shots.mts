import * as path from "path";

// Config for the documentation SCREENSHOT generator (tools/screenshots), not
// the test suite. It drives a real, downloaded Obsidian (Electron) headless
// under Xvfb inside the Dockerfile.e2e image and writes PNGs into docs/img/.
// Kept separate from wdio.conf.mts so `npm run test:e2e` never runs it.
const chromeArgs = [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-software-rasterizer",
];

export const config: WebdriverIO.Config = {
    runner: "local",
    framework: "mocha",
    specs: ["./tools/screenshots/capture.ts"],
    maxInstances: 1,
    capabilities: [
        {
            browserName: "obsidian",
            browserVersion: "latest",
            "wdio:obsidianOptions": {
                installerVersion: "latest",
                plugins: ["."],
                vault: "test/vaults/simple",
            },
            "goog:chromeOptions": {
                args: chromeArgs,
            },
        },
    ],
    services: ["obsidian"],
    reporters: ["obsidian"],
    cacheDir: path.resolve(".obsidian-cache"),
    mochaOpts: { ui: "bdd", timeout: 120000 },
    logLevel: "warn",
    injectGlobals: false,
};
