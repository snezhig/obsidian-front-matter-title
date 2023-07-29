import { Translation } from "../Locale";
import { Feature } from "../../Enum";

const zh: Translation = {
    validator: "验证方式",
    strategy: "策略",
    cancel: "取消",
    apply: "应用",
    feature: {
        [Feature.Alias]: {
            desc: "修改元数据（frontmatter）缓存中的别名，不影响实际别名",
            validator: {
                auto: {
                    name: "自动Frontmatter",
                    desc: "如果 frontmatter 不存在，则会在缓存中创建。可能会发生副作用。",
                },
                required: {
                    name: "有Frontmatter才生效",
                    desc: "只处理有 frontmatter 的文件。",
                },
            },
            strategy: {
                ensure: {
                    name: "增强",
                    desc: "仅当标题不在别名中时，才将标题设置为别名",
                },
                adjust: {
                    name: "调整",
                    desc: "将标题添加到别名中，但不影响现有别名",
                },
                replace: {
                    name: "替换",
                    desc: "用标题替换当前别名",
                },
            },
        },
        [Feature.Explorer]: {
            desc: "替换文件资源管理器中显示的标题",
        },
        [Feature.ExplorerSort]: {
            desc: "通过资源管理器功能，按标题对资源管理器中的文件进行排序",
        },
        [Feature.Graph]: {
            desc: "替换图谱/本地图谱中显示的标题",
        },
        [Feature.Header]: {
            desc: "替换Tab标签页中的页内标题并更新它们",
        },
        [Feature.Starred]: {
            desc: "替换内置书签插件中显示的标题",
        },
        [Feature.Search]: {
            desc: "替换搜索页面中显示的标题",
        },
        [Feature.Suggest]: {
            desc: "替换建议窗口中显示的标题",
        },
        [Feature.Tab]: {
            desc: "替换Tab标签页中显示的标题",
        },
        [Feature.InlineTitle]: {
            desc: "替换内嵌标题中显示的标题",
        },
        [Feature.Canvas]: {
            desc: "替换白板中显示的标题",
        },
        [Feature.Backlink]: {
            desc: "替换反向链接(链接提及)中显示的标题",
        },
        [Feature.NoteLink]: {
            desc: "替换文件中的内部链接",
            strategy: {
                all: "替换全部链接",
                onlyEmpty: "只替换没有别名的链接",
            },
            approval: {
                showModal: "显示确认窗口",
                auto: "使用自动确认",
            },
        },
    },
    manage: "管理",
    template: {
        features: {
            name: "特性模板",
            desc: "根据各特性功能独立管理模板",
        },
        main: "主模板",
        fallback: "备用",
        placeholder: "输入模板",
        commmon: {
            main: {
                name: "通用主模板",
                desc: `设置 yaml 路径，该值将用于文件标题。值必须是字符串或数值。还可以使用类似模板路径 "{{ }}"。
                还可以使用 #标题 来使用一级标题，或 _ basename 和其他保留字。
                查阅 Readme 了解更多`,
            },
            fallback: {
                name: "通用备用模板",
                desc: "作为备用选项的模板，当通用主模板无法解析出来时使用",
            },
        },
        used: "通用模板将会使用. 值为 {{value}}",
        specific: "这个特性功能将使用当前模板",
    },
    settings: "插件设置",
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
};


export default zh;
