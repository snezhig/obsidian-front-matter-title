import File from "@src/Obsidian/File";

const SI = {
    dispatcher: '',
    storage: '',
    cache: '',
    filter: '',
    placeholder: '',
    template: '',
    creator: '',
    resolver: '',
    logger: '',
    'logger:composer': '',
    'component:extractor:strategy': '',
    'component:extractor': '',
    'component:black_white_list': '',
    'placeholder:meta': '',
    'placeholder:brackets': '',
    'template:pattern': '',
    'factory:template': '',
    'creator:template': '',
    'factory:template:resolver': '',
    'factory:placeholder': '',
    'factory:placeholder:resolver': '',
    'factory:obsidian:file_modifiable': '',
    'factory:obsidian:file': '',
    delimiter: '',
    'getter:delimiter': '',
    'getter:obsidian:leaves': ''
};

for (const key of Object.keys(SI)) {
    //@ts-ignore
    SI[key] = Symbol.for(key);
}

export default SI;

export type FactoriesType = {
    'factory:obsidian:file': (path: string, type: string) => ({[k: string]: any}),
    'factory:obsidian:file_modifiable': (path: string) => File|null
}