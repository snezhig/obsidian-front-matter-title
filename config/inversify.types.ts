const SI = {
    "alias:modifier": "",
    "alias:modifier:strategy": "",
    "cache": "",
    "component:black_white_list": "",
    "component:extractor": "",
    "component:extractor:strategy": "",
    "creator": "",
    "creator:fallback": "",
    "creator:template": "",
    "delimiter": "",
    "dispatcher": "",
    "facade:obsidian": "",
    "factory:alias:modifier:strategy": "",
    "factory:feature": "",
    "factory:metadata:cache": "",
    "factory:obsidian:file": "",
    "factory:obsidian:file_modifiable": "",
    "factory:obsidian:meta": "",
    "factory:placeholder": "",
    "factory:placeholder:resolver": "",
    "factory:template": "",
    "factory:template:resolver": "",
    "feature": "",
    "feature:composer": "",
    "filter": "",
    "getter:delimiter": "",
    "logger": "",
    "logger:composer": "",
    "manager:composer": "",
    "obsidian:app": "",
    "placeholder": "",
    "placeholder:brackets": "",
    "placeholder:meta": "",
    "resolver": "",
    "service:note:link": "",
    "storage": "",
    "template:pattern": "",
    "templates": ""
};

for (const key of Object.keys(SI)) {
    //@ts-ignore
    SI[key] = Symbol.for(key);
}

export default SI;
