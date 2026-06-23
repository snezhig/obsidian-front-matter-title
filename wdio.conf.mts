import * as path from "path";

// Headless e2e against a real, downloaded Obsidian (Electron). Runs inside the
// Dockerfile.e2e image under Xvfb. The Chromium/Electron flags are required to
// run Electron in a container (no sandbox namespaces, no GPU).
const chromeArgs = [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-software-rasterizer",
];

export const config: WebdriverIO.Config = {
    runner: "local",
    framework: "mocha",
    specs: ["./test/e2e/**/*.e2e.ts"],
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
