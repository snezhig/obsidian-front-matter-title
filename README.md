## Meta Title Filename

This is a plugin for [Obsidian](https://obsidian.md).

## Introduction

Plugin **does not rename files**,
it just uses specific value from meta-block of markdown file as displayed filename in explorer or graph.

> Value from specific key must be a string or a number

## Examples

For example, you can have the following meta-block:

```yaml
alias:
  - MPI
status: open
short_name: 'PI'
tags:
  - '#project'
  - '#improvement'
date_updated: '2022-03-04 22:42:50'
additional:
  author: Snezhig
  title: Project ideas
```

|  Meta title path   | Original filename | Displayed filename |                    Comment                     |
|:------------------:|:-----------------:|:------------------:|:----------------------------------------------:|
|    `short_name`    |   202110151351    |        `PI`        |                   All is ok                    |
| `additional.title` |   202110151351    |  `Project Ideas`   |                   All is ok                    |
|    `not_exists`    |   202110151351    |   `202110151351`   |      Original because path does not exist      |
|    'additional'    |   202110151351    |   `202110151351`   | Original because value is not string or number |

## Result

|                My folder                 |               My folder with plugin                |
|:----------------------------------------:|:--------------------------------------------------:|
| ![](./github/images/Common%20Folder.png) | ![](./github/images/Structure%20with%20plugin.png) |

|                  Graph                  |               Graph with plugin                |
|:---------------------------------------:|:----------------------------------------------:|
| ![](./github/images/Common%20graph.png) | ![](./github/images/Graph%20with%20plugin.png) |

## Todo

* [ ] Add a possibility to make a template for file name
* [ ] Add markers to distinguish the same titles
* [ ] Add titles for search view
* [ ] Add commands to update titles manually
* [ ] Add settings for title's length
* [x] Fix the problem that titles in graph were not changed, in case application opens with graph

## Note

Feel free to write about bugs, mistakes or ideas for this plugin