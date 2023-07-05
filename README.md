# Front Matter Title

This is a plugin for [Obsidian](https://obsidian.md).

Why this plugin exist? I use zettelkasten method what means that all my files has names like timestamps `202208251731`.
Plugin give some options to display data from yaml block instead of original filename.

---

- [Installation](#installation)
- [Get started](#get-started)
- [Template Examples](./docs/TemplateExamples.md)
- [Features](./docs/Features.md)
- [Processor](./docs/Processor.md)
- [Api](#api)

---

# Installation

### Using obsidian.md app

* Download in from Obsidian through `Community plugins`

### Using BRAT plugin

* Use [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin

### Manual

* Download `obsidian-front-matter-title-#LAST_RELEASE#.zip`
  from [last release](https://github.com/Snezhig/obsidian-front-matter-title/releases/latest/) and unpack it into your
  vault by path: `.obsidian/plugins`

# Get started

Plugin **does not rename files**,
it just uses specific value from meta-block of markdown file as displayed filename in explorer or graph.

> Value from specific key **must be** a string or a number or an array(list)

First thing you might want to do after [installation](#installation) is to set your own path for title.

Open plugin's settings page and change `Template` which is has `title` value by default.

The value `title` mean that plugin will try to find `title` key in yaml block of any *.md file and use its value as a
new shown title.

Also, you can use dot-notation, that mean if you set `foo.bar` plugin will try to find `bar` key inside `foo` and use
its value.

```yaml

title: 'A new shown title' # will be used, if template is title 
foo:
  bar: 'Dot-notation shown title' # will be used, if template is foo.bar
```

[**See more**](./docs/TemplateExamples.md)

## Api

Look for integration? Try [API provider](https://github.com/Snezhig/front-matter-plguin-api-provider).

## Thank you

If you like this plugin and would like to buy me a coffee, you can!

<a href="https://www.buymeacoffee.com/snezhig" target="_blank">
<img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>

## Note

Feel free to write about bugs, mistakes or ideas for this plugin.
