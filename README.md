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

# Managers

## Explorer

> Display titles in app`s file explorer

|                 Disabled                 |                      Enabled                       |
|:----------------------------------------:|:--------------------------------------------------:|
| ![](./github/images/Common%20Folder.png) | ![](./github/images/Structure%20with%20plugin.png) |

## Graph

> Display titles in app's graph and local-graph

|                Disabled                 |                    Enabled                     |
|:---------------------------------------:|:----------------------------------------------:|
| ![](./github/images/Common%20graph.png) | ![](./github/images/Graph%20with%20plugin.png) |

## Quick switcher

> Display titles in app's quick switcher modal

|                    Disabled                     |                    Enabled                     |
|:-----------------------------------------------:|:----------------------------------------------:|
| ![](./github/images/Quick%20Switcher%20off.png) | ![](./github/images/Quick%20Switcher%20on.png) |

## File header

> Display title in opened file's header

|                   Disabled                   |                   Enabled                   |
|:--------------------------------------------:|:-------------------------------------------:|
| ![](./github/images/File%20header%20off.png) | ![](./github/images/File%20header%20on.png) |

## Thank you

If you like this plugin and would like to buy me a coffee, you can!

<a href="https://www.buymeacoffee.com/snezhig" target="_blank">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## Note

Feel free to write about bugs, mistakes or ideas for this plugin.
