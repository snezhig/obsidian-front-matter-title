import { Translation } from "../Locale";
import { Feature } from "../../Enum";

const zh_tw: Translation = {
    validator: "驗證方式",
    strategy: "策略",
    cancel: "取消",
    apply: "應用",
    feature: {
        [Feature.Alias]: {
            name: "別名Alias",
            desc: "修改元數據（frontmatter）緩存中的別名，不影響實際別名",
            validator: {
                auto: {
                    name: "自動Frontmatter",
                    desc: "如果 frontmatter 不存在，則會在緩存中創建。可能會發生副作用。",
                },
                required: {
                    name: "有Frontmatter才生效",
                    desc: "只處理有 frontmatter 的檔。",
                },
            },
            strategy: {
                ensure: {
                    name: "增強",
                    desc: "僅當標題不在別名中時，才將標題設置為別名",
                },
                adjust: {
                    name: "調整",
                    desc: "將標題添加到別名中，但不影響現有別名",
                },
                replace: {
                    name: "替換",
                    desc: "用標題替換當前別名",
                },
            },
        },
        [Feature.Explorer]: {
            name: "檔資源管理器",
            desc: "替換檔資源管理器中顯示的標題",
        },
        [Feature.Graph]: {
            name: "圖譜",
            desc: "替換圖譜/本地圖譜中顯示的標題",
        },
        [Feature.Header]: {
            name: "頁頂標題",
            desc: "替換Tab標籤頁頂部的標題並更新它們",
        },
        [Feature.Starred]: {
            name: "書簽",
            desc: "替換內置書簽插件中顯示的標題",
        },
        [Feature.Search]: {
            name: "搜索",
            desc: "替換搜索頁面中顯示的標題",
        },
        [Feature.Suggest]: {
            name: "建議",
            desc: "替換建議窗口中顯示的標題",
        },
        [Feature.Tab]: {
            name: "標籤頁",
            desc: "替換Tab標籤頁中顯示的標題",
        },
        [Feature.InlineTitle]: {
            name: "頁內標題",
            desc: "替換頁面內顯示的標題",
        },
        [Feature.Canvas]: {
            name: "白板",
            desc: "替換白板中顯示的標題",
        },
        [Feature.Backlink]: {
            name: "反向鏈接",
            desc: "替換反向鏈接(鏈接提及)中顯示的標題",
        },
        [Feature.NoteLink]: {
            name: "筆記鏈接",
            desc: "替換筆記中的內部鏈接",
            strategy: {
                options: {
                    all: "替換全部鏈接",
                    onlyEmpty: "只替換沒有別名的鏈接",
                },
            },
            approval: {
                options: {
                    showModal: "顯示確認窗口",
                    auto: "使用自動確認",
                },
            },
        },
    },
    manage: "管理",
    template: {
        features: {
            name: "特性範本",
            desc: "根據各特性功能獨立管理範本",
        },
        main: "主範本",
        fallback: "備用",
        placeholder: "輸入範本",
        common: {
            main: {
                name: "通用主範本",
                desc: `設置 yaml 路徑，該值將用於檔標題。值必須是字串或數值。還可以使用類似範本路徑 "{{ }}"。
                還可以使用 #標題 來使用一級標題，或 _ basename 和其他保留字。
                查閱 Readme 瞭解更多`,
            },
            fallback: {
                name: "通用備用範本",
                desc: "作為備用選項的範本，當通用主範本無法解析出來時使用",
            },
        },
        used: "通用範本將會使用. 值為 {{value}}",
        specific: "這個特性功能將使用當前範本",
    },
    settings: "插件設置",
    rule: {
        name: "規則",
        path: {
            name: "檔路徑規則",
            black: {
                name: "黑名單模式",
                desc: "插件將忽略路徑中的檔，每個路徑必須使用在新行中寫入.",
            },
            white: {
                name: "白名單模式",
                desc: "插件將處理路徑中的檔，每個路徑必須使用在新行中寫入.",
            },
        },
        delimiter: {
            name: "列表值",
            desc: "設置處理列表值的規則",
            first: "使用第一個值",
            join: "用分隔符號拼接全部",
            placeholder: {
                first: "會採用第一個值",
                join: "輸入分隔符號",
            },
        },
    },
    features: "特性功能",
    util: "工具",
    coffee: "如果您喜歡此插件並希望幫助/支持作者持續開發，請點擊以下按鈕:",
    debug_info: {
        title: "調試資訊",
        desc: "在終端中顯示調試資訊和捕捉到的錯誤資訊",
    },
    boot_delay: {
        title: "延遲啟動加載",
        desc: "插件將在指定時間（毫秒）後加載",
    },
    disabled: "禁用",
    processor: {
        name: "處理器",
        desc: "修改解析的標題",
        replace: {
            name: "替換",
            desc: "將執行",
            pattern: {
                name: "正則Pattern",
                desc: "將首先用作 RegExp 的第一個參數，然後用作 replace()的第一個參數",
            },
            flags: {
                name: "修飾符Flags",
                desc: "將用作新RegExp 的第二個參數",
            },
            replacement: {
                name: "替換值Replacement",
                desc: "將用作 replace() 的第二個參數",
            },
        },
        function: {
            name: "函數",
            desc: "將怎樣起作用:",
            valueDesc: "你在文本區輸入的值",
        },
    },
    command: {
        features: {
            reload: "重新加載特性功能",
            disable: "禁用特性功能",
        },
    },
};

export default zh_tw;
