# Changelog

Notable changes per release. The release workflow publishes the section matching
the released version as the GitHub Release notes, then appends a "Full Changelog"
compare link. Headings must be `## X.Y.Z` (the version, no `v`) so CI can find them.

At release time, rename `## Unreleased` to the version being released.

## 4.1.0

### Added
- Note titles now also show under "Unlinked mentions" in the backlinks panel (#190).

### Fixed
- Files added from outside Obsidian (e.g. via sync) now get their title in the file
  explorer right away, without needing a reload (#250).
- Bookmarked files placed inside a group now show their title (#257).
- Composite templates now work with non-Latin frontmatter keys, such as Chinese (#256).
- Tab titles are no longer lost when switching between tabs (#248, #277).
- Fixed a crash that could leave the interface blank after switching a workspace that has
  pinned tabs (#251).

### Changed
- The "loading" notifications on startup now only appear in Debug mode (#270).

## 4.0.0

### Added
- After the plugin updates, a short note pops up explaining what changed and where the
  project stands.

### Fixed
- Sorting the file explorer by created or modified date works again. Before, turning the
  plugin on left you stuck with name sorting only (#262).

### Changed
- The plugin is more robust when Obsidian updates. If a new Obsidian version changes
  something a feature depends on, only that one feature turns off (with a short notice)
  instead of the whole plugin breaking or showing a blank screen (#233, #251).

### Internal
- Added a Docker-based dev/test setup and end-to-end tests that run against a real Obsidian,
  fixed a build error, and fixed cloning the plugin's submodule (#273).
