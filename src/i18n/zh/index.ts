import { Translation } from "../Locale";
import { Feature } from "../../Enum";

const zh: Translation = {
    validator: "验证方式",
    strategy: "策略",
    cancel: "取消",
    apply: "应用",
    feature: {
        [Feature.Alias]: {
            name: "别名Alias",
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
            name: "文件资源管理器",
            desc: "替换文件资源管理器中显示的标题",
        },
        [Feature.Graph]: {
            name: "图谱",
            desc: "替换图谱/本地图谱中显示的标题",
        },
        [Feature.Header]: {
            name: "页顶标题",
            desc: "替换Tab标签页顶部的标题并更新它们",
        },
        [Feature.Starred]: {
            name: "书签",
            desc: "替换内置书签插件中显示的标题",
        },
        [Feature.Search]: {
            name: "搜索",
            desc: "替换搜索页面中显示的标题",
        },
        [Feature.Suggest]: {
            name: "建议",
            desc: "替换建议窗口中显示的标题",
        },
        [Feature.Tab]: {
            name: "标签页",
            desc: "替换Tab标签页中显示的标题",
        },
        [Feature.InlineTitle]: {
            name: "页内标题",
            desc: "替换页面内显示的标题",
        },
        [Feature.Canvas]: {
            name: "白板",
            desc: "替换白板中显示的标题",
        },
        [Feature.Backlink]: {
            name: "反向链接",
            desc: "替换反向链接(链接提及)中显示的标题",
        },
        [Feature.NoteLink]: {
            name: "笔记链接",
            desc: "替换笔记中的内部链接",
            strategy: {
                options: {
                    all: "替换全部链接",
                    onlyEmpty: "只替换没有别名的链接",
                },
            },
            approval: {
                options: {
                    showModal: "显示确认窗口",
                    auto: "使用自动确认",
                },
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
        common: {
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
        name: "规则",
        path: {
            name: "文件路径规则",
            black: {
                name: "黑名单模式",
                desc: "插件将忽略路径中的文件，每个路径必须使用在新行中写入.",
            },
            white: {
                name: "白名单模式",
                desc: "插件将处理路径中的文件，每个路径必须使用在新行中写入.",
            },
        },
        delimiter: {
            name: "列表值",
            desc: "设置处理列表值的规则",
            first: "使用第一个值",
            join: "用分隔符拼接全部",
            placeholder: {
                first: "会采用第一个值",
                join: "输入分隔符",
            },
        },
    },
    features: "特性功能",
    util: "工具",
    coffee: "如果您喜欢此插件并希望帮助/支持作者持续开发，请点击以下按钮:",
    debug_info: {
        title: "调试信息",
        desc: "在终端中显示调试信息和捕捉到的错误信息",
    },
    boot_delay: {
        title: "延迟启动加载",
        desc: "插件将在指定时间（毫秒）后加载",
    },
    disabled: "禁用",
    processor: {
        name: "处理器",
        desc: "修改解析的标题",
        replace: {
            name: "替换",
            desc: "将执行",
            pattern: {
                name: "正则Pattern",
                desc: "将首先用作 RegExp 的第一个参数，然后用作 replace()的第一个参数",
            },
            flags: {
                name: "修饰符Flags",
                desc: "将用作新RegExp 的第二个参数",
            },
            replacement: {
                name: "替换值Replacement",
                desc: "将用作 replace() 的第二个参数",
            },
        },
        function: {
            name: "函数",
            desc: "将怎样起作用:",
            valueDesc: "你在文本区输入的值",
        },
    },
    command: {
        features: {
            reload: "重新加载特性功能",
            disable: "禁用特性功能",
        },
    },
};

export default zh;
