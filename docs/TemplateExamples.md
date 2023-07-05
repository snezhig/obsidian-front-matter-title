# Examples

Let's imagine that we have a file `MyFolder/MyNote.md` with the following content:

```yaml
---
alias: [ 'MPI' ]
status: open
short: 'PI'
tags: [ '#project', '#improvement' ]
date_updated: '2022-03-04 22:42:50'
additional:
  author: Snezhig
  title: Project ideas
---
# MyHeading

Some content of the file
```


|  #  |               Template                | Original filename | Displayed filename |
|:---:|:-------------------------------------:|:-----------------:|:------------------:|
|  1  |                `short`                |      MyNote       |        `PI`        |
|  2  |          `additional.author`          |      MyNote       |     `Snezhig`      |
|  3  |             `not_exists`              |      MyNote       |      `MyNote`      |
|  4  |             `additional`              |      MyNote       |      `MyNote`      |
|  5  |                `tags`                 |      MyNote       |     `#project`     |
|  6  |              `#heading`               |      MyNote       |    `MyHeading`     |
|  7  |       `{{short}} - {{status}}`        |      MyNote       |    `PI - open`     |
|  8  |      `{{tags}} - {{additional}}`      |      MyNote       |   `#project - `    |
|  9  |              `_basename`              |   202110151351    | `Snezhig - MyNote` |

> **If you use the only one value, use `short` instead of `{{short}}` to have a better performance**

# Explanation

* `short` - plugin used value of `short` key which is `PI`
* `additional.author` - plugin used a value of `additional` key, then it used a value of `author` key, which is `Snezhig`
* `not_exist` - plugin tried to find a value of `not_exist` key, but it's not exist, so title was not changed
* `additional` - plugin tried to use `additonal` key value, but it's an object, so title was not changed
* `tags` - plugin used a value of `tags` key. The value is an array, so plugin used first value of list. You can tell plugin to split all values into a string by `List values` rule
* `#heading` - plugin used first found header of the file which is `MyHeading`
* `{{short}} - {{status}}` - plugin used values of `short` and `status` keys.
* `{{tags}} - {{additional}}` - plugin used values of `tags` and `additional`.
* `_basename` -  plugin used a `basename` key of [File Info](#FileInfo)


# Description

## Values

Plugin can use extract values from meta-block, file info or headings.

Also, template can be set as `path.to.value` and plugin will try to get value from `path` field, then from `to` field
and, finally from `value` field. [See more](#Examples).

### Meta block

Template is a string that will be used to resolve a title for file

Any value in the template is meant to be key from file's meta block

### FileInfo

If you add `_` prefix in your template, plugin will use values
from [TFile](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts) object

For example: `_basename` means that plugin will use value from `basename` field

### Heading

If you set template as `#heading`, plugin will use first heading from file

## Types

### Simple template

Any string in you template will be used like a single key

### Composite template

If you want to use some values for title you can use `{{ }}` to make plugin use each value inside ``{{ }}`` as an
individual key
