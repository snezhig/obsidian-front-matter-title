# Settings reference

Everything in **Settings → Front Matter Title**, beyond [Features](./Features.md) and [Templates](./Templates.md). Open it via **Settings → Community plugins → Front Matter Title**.

- [Rules](#rules) — limit which files are processed and how list values are handled
- [Util](#util) — boot behavior and debugging
- [Commands](#commands) — palette commands
- [Processor](#processor) — advanced title transformation

---

## Rules

Rules decide **which notes** the plugin touches and **how list values** become a title. They apply before the title is built.

### File path rule

Restrict the plugin to certain folders/files. Write one path per line. Pick a mode:

| Mode | Behavior |
|---|---|
| **White list mode** | Only files matched by the listed paths are processed. Everything else keeps its filename. |
| **Black list mode** | Files matched by the listed paths are ignored. Everything else is processed. |

Use this when you only want titles in some part of your vault (e.g. a `zettel/` folder), or to exclude templates/attachments.

### List values

Controls what happens when the frontmatter value is a list (array), e.g. `tags: ['#a', '#b']`.

| Mode | Result for `['#a', '#b']` |
|---|---|
| **Use first value** | `#a` — only the first item is used. |
| **Join all by delimiter** | `#a, #b` — all items joined by the **Delimiter** you type (the delimiter field appears only in this mode). |

---

## Util

### Boot delay

Loads the plugin after a delay, in milliseconds. Useful if it initializes before Obsidian or other plugins are ready.

### Boot in background

Loads the plugin in the background so it doesn't block the app while starting. Helpful on large vaults.

### Debug info

Shows debug info and any caught errors in the developer console (**Ctrl/Cmd+Shift+I**). Turn this on first when something doesn't work as expected — see [FAQ & troubleshooting](./FAQ.md).

---

## Commands

Available from the command palette (**Ctrl/Cmd+P**):

| Command | What it does |
|---|---|
| **Reload features** | Re‑applies all enabled features and refreshes the UI. Use after editing frontmatter or settings if a title looks stale. |
| **Disable features** | Immediately turns all active features off (titles revert to filenames) without changing your saved settings. |

---

## Processor

An advanced, optional step that transforms the resolved title with a regular expression or custom JavaScript. Off by default. See **[Processor](./Processor.md)**.
