# Manual check — 4.1.0 fixes

This vault has the plugin's features enabled in the seeded settings. Drop the built
`main.js` + `manifest.json` into `.obsidian/plugins/obsidian-front-matter-title-plugin/`,
open the vault, then walk the list.

- **#250 — externally created files.** Create a new note (e.g. from another tab or device)
  with `title:` in its frontmatter. It should show the title in the file explorer right
  away, without reloading the plugin.
- **#257 — bookmarks in a group.** Open Bookmarks, expand **My Group** → the bookmarked
  file shows its title (`Hello From Frontmatter`), not the filename.
- **#246 — unlinked mentions.** Open `202208251731`, open the Backlinks panel, expand
  **Unlinked mentions** → `mentioner` appears as **The Mentioner Note**.
- **#248 — tab titles.** Open a few notes in tabs and switch between them → each tab keeps
  its frontmatter title (it should not revert to the filename).
- **#256 — non-Latin keys.** `cjk-key.md` has a `完稿` frontmatter key. Set the Explorer
  template to `{{完稿}}` (Settings → Front Matter Title → Explorer) → `cjk-key` shows
  **完成稿件** (a composite template with a non-Latin key now works).
- **#270 — startup notices.** The "Loading…" notifications on startup now appear only when
  Debug mode is enabled.

Already visible without extra steps: Zettelkasten-named notes show titles; sorting by title
(node-a/node-z) and by date works; the inline title is not duplicated.
