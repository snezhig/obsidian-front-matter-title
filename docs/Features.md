# Features

A **feature** is a single place in Obsidian where the plugin replaces the displayed filename with your frontmatter title. Each one is independent: turn on only the places you care about in **Settings → Front Matter Title → Features**.

Every feature uses your title [template](./Templates.md). By default they all share the **Common main template** (`title`), but each feature can use its own template — click **Manage** next to a feature to set one.

The features below are grouped by where you'll notice them.

---

## Navigation & lists

These help you find notes by their real title instead of a cryptic filename.

### Explorer

> Replace shown titles in the file explorer.

The most common feature to enable first.

|          Disabled           |          Enabled           |
|:---------------------------:|:--------------------------:|
| ![](img/Explorer%20Off.png) | ![](img/Explorer%20On.png) |

#### Explorer → Sort

When **Explorer** is on, you can also toggle **Sort** (click **Manage** on the Explorer feature). The explorer then sorts files by their displayed title instead of by filename — so the order matches what you actually read.

|            Sort off             |            Sort on             |
|:-------------------------------:|:------------------------------:|
| ![](img/ExplorerSort%20Off.png) | ![](img/ExplorerSort%20On.png) |

### Search

> Replace shown titles in the search results panel.

|         Disabled          |         Enabled          |
|:-------------------------:|:------------------------:|
| ![](img/Search%20Off.png) | ![](img/Search%20On.png) |

### Suggest

> Replace shown titles in suggest modals — the quick switcher, link autocompletion, and similar pop‑ups.

|            Disabled            |            Enabled            |
|:------------------------------:|:-----------------------------:|
| ![](img/Suggest%20Off%201.png) | ![](img/Suggest%20On%201.png) |
| ![](img/Suggest%20Off%202.png) | ![](img/Suggest%20On%202.png) |

### Bookmarks

> Replace shown titles in the built‑in Bookmarks plugin.

|         Disabled          |         Enabled          |
|:-------------------------:|:------------------------:|
| ![](img/BookmarksOff.png) | ![](img/BookmarksOn.png) |

### Backlink

> Replace shown titles in the Backlinks panel (Linked mentions).

|          Disabled           |          Enabled           |
|:---------------------------:|:--------------------------:|
| ![](img/Backlink%20Off.png) | ![](img/Backlink%20On.png) |

---

## Editor & tabs

These show the title while you read and write the note.

### Tabs

> Replace shown titles in tabs.

|        Disabled        |        Enabled        |
|:----------------------:|:---------------------:|
| ![](img/Tab%20Off.png) | ![](img/Tab%20On.png) |

### Header

> Replace titles in the header of open panes (leaves) and keep them updated.

|          Disabled          |          Enabled          |
|:--------------------------:|:-------------------------:|
| ![](img/Heading%20Off.png) | ![](img/Heading%20On.png) |

### Inline

> Replace the shown title in the **Inline Title** (the large title rendered at the top of the note body).

|         Disabled          |         Enabled          |
|:-------------------------:|:------------------------:|
| ![](img/Inline%20Off.png) | ![](img/Inline%20On.png) |

### Window Frame Title

> Replace the shown title in the window frame (the OS / app title bar).

|          Disabled           |          Enabled           |
|:---------------------------:|:--------------------------:|
| ![](img/WindowFrameOff.png) | ![](img/WindowFrameOn.png) |

---

## Visual

### Graph

> Replace shown titles in the graph and local‑graph.

|         Disabled         |         Enabled         |
|:------------------------:|:-----------------------:|
| ![](img/Graph%20Off.png) | ![](img/Graph%20On.png) |

### Canvas

> Replace shown titles in Canvas cards.

|         Disabled          |         Enabled          |
|:-------------------------:|:------------------------:|
| ![](img/Canvas%20Off.png) | ![](img/Canvas%20On.png) |

---

## Content‑changing features

> [!WARNING]
> Unlike the features above, these two affect the metadata cache or the text of your notes. Read the notes before enabling.

### Alias

> Modify the alias in the metadata cache. Your real alias in the file is **not** affected — only Obsidian's cache, so the title becomes searchable/linkable as an alias.

This feature has two options (click **Manage**):

**Validator** — which files it processes:

| Option | What it does |
|---|---|
| **Frontmatter Auto** | If a note has no frontmatter, an entry is created **in the cache**. Convenient, but side‑effects may occur. |
| **Frontmatter Required** | Only notes that already have frontmatter are processed. Safer. |

**Strategy** — what it does with the alias:

| Option | What it does |
|---|---|
| **Ensure** | Set the title as an alias only if no alias exists yet. |
| **Adjust** | Add the title to the aliases without touching existing ones. |
| **Replace** | Replace the current alias with the title. |

|         Disabled         |         Enabled         |
|:------------------------:|:-----------------------:|
| ![](img/Alias%20Off.png) | ![](img/Alias%20On.png) |

### Note Link

> Replace the link text of internal `[[links]]` inside your notes so they read as the target's title. **This edits your note files.**

Full guide, options and examples: **[Note Link](./Features/NoteLink.md)**.

In short, it has two options:

- **Strategy** — *Replace all links* or *Replace only links without alias* (don't override links you've already aliased).
- **Approval** — *Show approve modal* (confirm each batch of changes) or *Use auto approve* (apply automatically).
