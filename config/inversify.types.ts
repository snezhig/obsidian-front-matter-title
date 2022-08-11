const SI = {
    dispatcher: '',
    storage: '',
    cache: '',
    filter: '',
    placeholder: '',
    template: '',
    creator: '',
    resolver: '',
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