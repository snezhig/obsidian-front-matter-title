## Front Matter Title

__Also known as `Meta Title Filename`__

This is a plugin for [Obsidian](https://obsidian.md).

## Introduction

Plugin **does not rename files**,
it just uses specific value from meta-block of markdown file as displayed filename in explorer or graph.

> Value from specific key **must be** a string or a number or an array(list)

# Functional

* Display title from frontmatter in `graph`, `explorer`, `markdown leaf header`, `quick switcher`
* Settings to switch on\off each of type from above separately
* Settings to exclude folders or files
* Option to use `template like` title path
* List values support

## Installation (one of)

* Download in from Obsidian through `Community plugins`
* Use [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
* Download `obsidian-front-matter-title-#LAST_RELEASE#.zip` from last release and unpack it into your vault by
  path: `.obsidian/plugins`

## Examples

For example, you can have the following meta-block:

```yaml
alias:
  - MPI
status: open
short: 'PI'
tags:
  - '#project'
  - '#improvement'
date_updated: '2022-03-04 22:42:50'
additional:
  author: Snezhig
  title: Project ideas

```

### Simple path

- Use only one key from yaml block

|       Meta title path        | Original filename |    Displayed filename     |                        Comment                        |
|:----------------------------:|:-----------------:|:-------------------------:|:-----------------------------------------------------:|
|           `short`            |   202110151351    |           `PI`            |                       All is ok                       |
|      `additional.title`      |   202110151351    |      `Project Ideas`      |                       All is ok                       |
|         `not_exists`         |   202110151351    |      `202110151351`       |         Original because path does not exist          |
|         `additional`         |   202110151351    |      `202110151351`       | Original because value is not string, number or array |
|            `tags`            |   202110151351    |        `#project`         |       First value is used (depends on settings)       |
|            `tags`            |   202110151351    | `#project - #improvement` |  Values are joined by delimiter defined in settings   |

### Path as a template

- Use one or more keys with static value
- Use keys from original path:
    - _**_basename**_ - base name of file without extension
    - _**_name**_ - name of file with extension
    - _**_path**_ - path to file with folders and extension

|       Meta title path        |  Original filename  |     Displayed filename     |               Comment                |
|:----------------------------:|:-------------------:|:--------------------------:|:------------------------------------:|
|         `{{short}}`          |    202110151351     |            `PI`            |              All is ok               |
|   `{{short}} - {{status}}`   |    202110151351     |        `PI - open`         |              All is ok               |
| `{{short}} - {{not_exists}}` |    202110151351     |          `PI - `           |       The second part is empty       |
| `{{short}} - {{not_exists}}` |    202110151351     |          `PI - `           |       The second part is empty       |
| `{{short}} - {{_basename}}`  | folder/202110151351 |    `PI - 202110151351`     | The second part is original basename |
|   `{{short}} - {{_path}}`    | folder/202110151351 | `PI - folder/202110151351` |   The second part is original path   |
|   `{{short}} - {{_name}}`    | folder/202110151351 |   `PI - 202110151351.md`   |   The second part is original name   |

> **If you use the only one value, use `short` instead of `{{short}}` to have a better performance**

## Result

|                My folder                 |               My folder with plugin                |
|:----------------------------------------:|:--------------------------------------------------:|
| ![](./github/images/Common%20Folder.png) | ![](./github/images/Structure%20with%20plugin.png) |

|                  Graph                  |               Graph with plugin                |
|:---------------------------------------:|:----------------------------------------------:|
| ![](./github/images/Common%20graph.png) | ![](./github/images/Graph%20with%20plugin.png) |

## Todo

* [x] Add a possibility to make a template for file name
* [ ] Add markers to distinguish the same titles
* [ ] Add titles for search view
* [ ] Add commands to update titles manually
* [ ] Add settings for title's length
* [x] Fix the problem that titles in graph were not changed, in case application opens with graph
* [x] Add local-graph compatibility
* [x] Add support for leaf's header

## Thank you

If you like this plugin and would like to buy me a coffee, you can!

<a href="https://www.buymeacoffee.com/snezhig" target="_blank">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## Note

Feel free to write about bugs, mistakes or ideas for this plugin.
