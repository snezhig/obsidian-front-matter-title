import { Feature } from "../../Enum";

//First version
const en = {
    validator: "Validator",
    strategy: "Strategy",
    cancel: "Cancel",
    apply: "Apply",
    feature: {
        [Feature.Alias]: {
            name: "Alias",
            desc: "Modify alias in metadata cache. The real alias will not be affected",
            validator: {
                auto: {
                    name: "Frontmatter Auto",
                    desc: "If frontmatter does not exist, it will be created in cache. Side-effects may occur.",
                },
                required: {
                    name: "Frontmatter Required",
                    desc: "Only files with frontmatter will be processed.",
                },
            },
            strategy: {
                ensure: {
                    name: "Ensure",
                    desc: "Set title as an alias only if the one does not exist",
                },
                adjust: {
                    name: "Adjust",
                    desc: "Add title to alias and without affect on existing alias",
                },
                replace: {
                    name: "Replace",
                    desc: "Replace current alias with title",
                },
            },
        },
        [Feature.Explorer]: {
            name: "Explorer",
            desc: "Replace shown titles in the file explorer",
        },
        [Feature.ExplorerSort]: {
            name: "Explorer sort",
            desc: "Sort files in explorer by titles from Explorer feature",
        },
        [Feature.Graph]: {
            name: "Graph",
            desc: "Replace shown titles in the graph/local-graph",
        },
        [Feature.Header]: {
            name: "Header",
            desc: "Replace titles in header of leaves and update them",
        },
        [Feature.Starred]: {
            name: "Starred",
            desc: "Replace shown titles in built-in starred plugin",
        },
        [Feature.Search]: {
            name: "Search",
            desc: "Replace shown titles in search leaf",
        },
        [Feature.Suggest]: {
            name: "Suggest",
            desc: "Replace shown titles in suggest modals",
        },
        [Feature.Tab]: {
            name: "Tabs",
            desc: "Replace shown titles in tabs",
        },
        [Feature.InlineTitle]: {
            name: "Inline",
            desc: "Replace shown titles in Inline Title",
        },
        [Feature.Canvas]: {
            name: "Canvas",
            desc: "Replace shown titles in Canvas",
        },
        [Feature.Backlink]: {
            name: "Backlink",
            desc: "Replace shown titles in Backlink(Linked mentions)",
        },
        [Feature.NoteLink]: {
            name: "Note Link",
            desc: "Replace internal links in files",
            strategy: {
                all: "Repalce all links",
                onlyEmpty: "Replace only links without alias",
            },
            approval: {
                showModal: "Show approve modal",
                auto: "Use auto approve",
            },
        },
    },
    manage: "Manage",
    template: {
        features: {
            name: "Feature's templates",
            desc: "Manage templates for this feature individually",
        },
        main: "Main",
        fallback: "Fallback",
        placeholder: "Type a template",
        common: {
            main: {
                name: "Common main template",
                desc: `Set a yaml path, which value will be used as a file title. Value must be string or numeric. Also you can use template-like path using "{{ }}".
				Also you can use #heading to use first Heading from a file or _basename and another reserved words. 
				See Readme to find out more`,
            },
            fallback: {
                name: "Common fallback template",
                desc: "This template will be used as a fallback option if the main template is not resolved",
            },
        },
        used: 'Common template will be used. It\'s value is "{{value}}"',
        specific: "Current template will be used for this feature",
    },
    settings: "Settings for plugin",
    rule: {
        name: "Rules",
        path: {
            name: "File path rule",
            black: {
                name: "Black list mode",
                desc: "Files that are located by paths will be ignored by plugin. Each path must be written with new line.",
            },
            white: {
                name: "White list mode",
                desc: "Files that are located by paths will be processed by plugin. Each path must be written with new line.",
            },
        },
        delimiter: {
            name: "List values",
            desc: "Set the rule about how to process list values",
            first: "Use first value",
            join: "Join all by delimiter",
            placeholder: {
                first: "First value will be used",
                join: "Type a delimiter",
            },
        },
    },
    features: "Features",
    util: "Util",
    coffee: "If you like this plugin and you would like to help support continued development, you can use the buttons below:",
    debug_info: {
        title: "Debug info",
        desc: "Show debug info and caught errors in console",
    },
    boot_delay: {
        title: "Boot delay",
        desc: "Plugin will be loaded with specified delay in ms",
    },
    disabled: "Disabled",
    processor: {
        name: "Processor",
        desc: "Modifies resolved title",
        replace: {
            name: "Replace",
            desc: "What will be executed",
            pattern: {
                name: "Pattern",
                desc: "Will be used as a first argument of RegExp first, and then as a first argument of replace()",
            },
            flags: {
                name: "Flags",
                desc: "Will be used as a second argument of new RegExp",
            },
            replacement: {
                name: "Replacement",
                desc: "Will be used as a second argument of replace()",
            },
        },
        function: {
            name: "Function",
            desc: "How it will work:",
            valueDesc: "Your value of text area",
        },
    },
    command: {
        features: {
            reload: "Reload features",
            disable: "Disable features",
        },
    },
};

export default en;
