# Front Matter Title

__Also known as `Meta Title Filename`__

This is a plugin for [Obsidian](https://obsidian.md).

# Introduction

Plugin **does not rename files**,
it just uses specific value from meta-block of markdown file as displayed filename in explorer or graph.

> Value from specific key **must be** a string or a number or an array(list)

# Installation (one of)

* Download in from Obsidian through `Community plugins`
* Use [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
* Download `obsidian-front-matter-title-#LAST_RELEASE#.zip`
  from [last release](https://github.com/Snezhig/obsidian-front-matter-title/releases/latest/) and unpack it into your
  vault by path: `.obsidian/plugins`

# Template

## Values

Plugin can use extract values from meta-block, file info or headings.

Also, template can be set as `path.to.value` and plugin will try to get value from `path` field, then from `to` field
and, finally from `value` field. [See more](#Examples).

### Meta block

Template is a string that will be used to resolve a title for file

Any value in the template is meant to be key from file's meta block

### File info

If you add `_` prefix in your template, plugin will use values
from [TFile](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts) object

For example: `_basename` means that plugin will use value from `basename` field

### Heading

If you set template as `#heading`, plugin will you first heading from file

## Types

### Simple template

Any string in you template will be used like a single key

### Composite template

If you want to use some values for title you can use `{{ }}` to make plugin use each value inside ``{{ }}`` as an
individual key

# Examples

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

And the following content:

```markdown
# First Heading

Some info

# Second Heading
```

|          Template           | Original filename | Displayed filename |
|:---------------------------:|:-----------------:|:------------------:|
|           `short`           |   202110151351    |        `PI`        |
|     `additional.title`      |   202110151351    |  `Project Ideas`   |
|        `not_exists`         |   202110151351    |   `202110151351`   |
|        `additional`         |   202110151351    |   `202110151351`   |
|           `tags`            |   202110151351    |     `#project`     |
|         `#heading`          |   202110151351    |  `First Heading`   |
|  `{{short}} - {{status}}`   |   202110151351    |    `PI - open`     |
| `{{tags}} - {{additional}}` |   202110151351    |   `# project - `   |

> **If you use the only one value, use `short` instead of `{{short}}` to have a better performance**

# Features

## Alias

> Modify frontmatter cache to add or replace alias or just ensure that the one exists

|                Disabled                 |               Enabled               |
|:---------------------------------------:|:-----------------------------------:|
| ![](./resources/img/Alias%20Off.png) | ![](./resources/img/Alias%20On.png) |

## Explorer

> Display titles in app`s file explorer

|                Disabled                 |                Enabled                 |
|:---------------------------------------:|:--------------------------------------:|
| ![](./resources/img/Explorer%20Off.png) | ![](./resources/img/Explorer%20On.png) |

## Explorer Sort

> Sort files by custom titles. Available only if Explorer is enabled

|                Disabled                |                  Enabled                   |
|:--------------------------------------:|:------------------------------------------:|
| ![](./resources/img/Explorer%20On.png) | ![](./resources/img/ExplorerSort%20On.png) |

## Graph

> Display titles in app's graph and local-graph

|               Disabled               |               Enabled               |
|:------------------------------------:|:-----------------------------------:|
| ![](./resources/img/Graph%20Off.png) | ![](./resources/img/Graph%20On.png) |

## Header

> Display title in opened file's header

|                Disabled                |                Enabled                |
|:--------------------------------------:|:-------------------------------------:|
| ![](./resources/img/Heading%20Off.png) | ![](./resources/img/Heading%20On.png) |

## Starred

> Display title in starred window

|                Disabled                |                Enabled                |
|:--------------------------------------:|:-------------------------------------:|
| ![](./resources/img/Starred%20Off.png) | ![](./resources/img/Starred%20on.png) |

## Search

> Display titles in the search window

|               Disabled                |               Enabled                |
|:-------------------------------------:|:------------------------------------:|
| ![](./resources/img/Search%20Off.png) | ![](./resources/img/Search%20On.png) |

## Suggest

> Display titles in suggest modal\windows.

|                  Disabled                  |                  Enabled                  |
|:------------------------------------------:|:-----------------------------------------:|
| ![](./resources/img/Suggest%20Off%201.png) | ![](./resources/img/Suggest%20On%201.png) |
| ![](./resources/img/Suggest%20Off%202.png) | ![](./resources/img/Suggest%20On%202.png) |

## Tab

> Display titles in leaf's tab

|              Disabled              |              Enabled              |
|:----------------------------------:|:---------------------------------:|
| ![](./resources/img/Tab%20Off.png) | ![](./resources/img/Tab%20On.png) |

## Thank you

If you like this plugin and would like to buy me a coffee, you can!

<a href="https://www.buymeacoffee.com/snezhig" target="_blank">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## Note

Feel free to write about bugs, mistakes or ideas for this plugin.
