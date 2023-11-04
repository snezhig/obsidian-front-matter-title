# Examples

Let's imagine that we have a file `MyFolder/MyNote.md` with the following content:

```yaml
---
alias: [ 'MPI' ]
status: open
short: 'PI'
empty: 
tags: [ '#project', '#improvement' ]
date_updated: '2022-03-04 22:42:50'
additional:
  author: Snezhig
  title: Project ideas
---
# MyHeading

Some content of the file
```


|   #   |                       Template                       | Original filename | Displayed filename |
| :---: | :--------------------------------------------------: | :---------------: | :----------------: |
|   1   |                       `short`                        |      MyNote       |        `PI`        |
|   2   |                 `additional.author`                  |      MyNote       |     `Snezhig`      |
|   3   |                     `not_exists`                     |      MyNote       |      `MyNote`      |
|   4   |                     `additional`                     |      MyNote       |      `MyNote`      |
|   5   |                        `tags`                        |      MyNote       |     `#project`     |
|   6   |                      `#heading`                      |      MyNote       |    `MyHeading`     |
|   7   |                `empty\|status\|short`                |      MyNote       |       `open`       |
|   8   |           `prefix {{short}} - {{status}}`            |      MyNote       | `prefix PI - open` |
|   9   |           `prefix{{ status }}-{{ short}}`            |      MyNote       | `prefix open - PI` |
|  10   |             `{{tags}} - {{additional}}`              |      MyNote       |   `#project - `    |
|  11   |        `{{tags }}-{{ additional }}-{{short}}`        |      MyNote       |  `#project - PI`   |
|  12   | `prefix{{ empty\|additional\|short\|status }}suffix` |      MyNote       | `prefix PI suffix` |
|  13   |                     `_basename`                      |      MyNote       |      `MyNote`      |

> **If you use the only one value, use `short` instead of `{{short}}` to have a better performance**

# Explanation

1. `short` - plugin used value of `short` key which is `PI`
2. `additional.author` - plugin used a value of `additional` key, then it used a value of `author` key, which is `Snezhig`
3. `not_exist` - plugin tried to find a value of `not_exist` key, but it's not exist, so title was not changed
4. `additional` - plugin tried to use `additonal` key value, but it's an object, so title was not changed
5. `tags` - plugin used a value of `tags` key. The value is an array, so plugin used first value of list. You can tell plugin to split all values into a string by `List values` rule
6. `#heading` - plugin used first found header of the file which is `MyHeading`
7. `empty\|status\|short`  - plugin separated template into three values `empty`, `status`, `short` and used first non-empty value which is `open` from `status` key
8. `prefix {{short}} - {{status}}` - plugin used values of the `short` and `status` keys and keeps all values outside brackes including spaces.
9. `prefix{{ status }}-{{ short}}` - plugin used values of the `short` and `status` keys, including spaces and keeps all values outside brackets
10. `{{tags}} - {{additional}}` - plugin used values of `tags` and `additional`, but `additional` is object that is not supported and shown as an empty string.
11. `{{tags }}-{{ additional }}-{{short}}` - plugin used values of the `tags`, `additional` and `short` keys. Notice that spaces inside brackets of `additional` key are not kept because value of the key is empty.
12. `prefix{{ empty\|additional\|short\|status }}suffix` - plugin used first non-empty value of the keys which is `PI` from `short` key and kept spaces because value is not empty.
13. `_basename` -  plugin used a `basename` key of [File Info](#FileInfo)


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

### Logic

Template with sumbol "|" will  be interpreted with "or" logic. 
For example template "foo|bar|baz" will be replaced with value from first non-empty key

## Types

### Simple template

Any string in you template will be used like a single key

### Composite template

If you want to use some values for title you can use `{{ }}` to make plugin use each value inside ``{{ }}`` as an
individual key. Side spaces inside brackets `{{ foo }}` will be kept, if the value of `foo` key is not empty
