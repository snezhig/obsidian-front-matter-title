## Meta Title Filename

This is a plugin for [Obsidian](https://obsidian.md).

## Introduction

Plugin let you replace filename with meta block. For example, you can have a `my_title`
key in your file with specific title and configure the plugin to read this key.

Also, plugin supports deep-key-value, for example you can have the following meta:

```yaml
alias:
  - MPI
status: open
tags:
  - '#project'
  - '#improvement'
date_updated: '2022-03-04 22:42:50'
additional:
  author: Snezhig
  title: Project ideas
```

Then set the path like `additional.title` and plugin will set `Project ideas` as filename

> If key does not have a value, filename will not be replaced

## Examples

|                My folder                 |               My folder with plugin                |
|:----------------------------------------:|:--------------------------------------------------:|
| ![](./github/images/Common%20Folder.png) | ![](./github/images/Structure%20with%20plugin.png) |

|                  Graph                  |               Graph with plugin                |
|:---------------------------------------:|:----------------------------------------------:|
| ![](./github/images/Common%20graph.png) | ![](./github/images/Graph%20with%20plugin.png) |

## Todo

* [ ] Add a possibility to make a template fo file name
* [ ] Add markers to distinguish the same titles
* [ ] Add titles for search view
* [ ] Add commands to update titles manually
* [ ] Add settings for title's length
* [ ] Fix the problem that titles in graph were not changed, in case application opens with graph

## Note

Feel free to write about bugs, mistakes or ideas for this plugin