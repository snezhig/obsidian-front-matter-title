# FAQ & troubleshooting

### Does the plugin rename or edit my files?

No. By default it only changes what Obsidian **displays** — your filenames and file contents stay untouched. The two exceptions are opt‑in and clearly marked: the [Alias](./Features.md#alias) feature modifies the metadata **cache** (not the file), and the [Note Link](./Features/NoteLink.md) feature rewrites `[[link]]` text **inside your notes**.

### My title isn't showing. What do I check?

Go down this list:

1. **Is the feature enabled?** Titles only appear where you turned a [feature](./Features.md) on (e.g. Explorer).
2. **Does the template match your frontmatter?** The default [template](./Templates.md) is `title`, so the note needs a `title:` key. If you use another key, set it as the **Common main template**.
3. **Is the value a supported type?** It must be a **string, number, or list**. An object (nested map with no leaf value) is ignored.
4. **Is the file excluded by a rule?** Check **Rules → File path rule** — a white/black list may be skipping it. See [Settings](./Settings.md#rules).
5. **Stale title?** Run the **Reload features** command (**Ctrl/Cmd+P**).
6. Still stuck? Enable **Debug info** (see below).

### The value is a list. Which item is used?

By default the **first** item. You can instead join all items with a delimiter — see **List values** in [Settings](./Settings.md#list-values).

### The value is an object / nested map. Why is it ignored?

Only a single string, number, or list can become a title. Point the template at a leaf value instead, e.g. `book.title` rather than `book`. See [Template examples](./TemplateExamples.md).

### Can I show the title in more than one place?

Yes — each place is a separate [feature](./Features.md) you toggle independently (Explorer, Search, Tabs, Graph, Canvas, and more). You can even give each feature its own [template](./Templates.md#per-feature-templates).

### Obsidian feels slow on a large vault.

- Enable **Boot in background** and/or set a **Boot delay** in [Settings → Util](./Settings.md#util).
- In templates, use a plain key (`title`) instead of `{{title}}` when you only need one value.

### How do I debug or report a problem?

1. Enable **Debug info** in [Settings → Util](./Settings.md#debug-info).
2. Open the developer console: **Ctrl/Cmd+Shift+I**.
3. Reproduce the issue and copy any logged errors.
4. Open an issue on [GitHub](https://github.com/Snezhig/obsidian-front-matter-title/issues) with the steps and the log.

### How do I temporarily turn everything off?

Run the **Disable features** command. It reverts all titles to filenames without changing your saved settings; **Reload features** brings them back.
