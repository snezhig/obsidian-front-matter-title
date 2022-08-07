const SI = {
    dispatcher: '',
    storage: '',
    cache: '',
    filter: '',
    placeholder: '',
    'component.extractor.strategy': '',
    'component.extractor': '',
    'component.black_white_list': '',
    'placeholder.meta': '',
    'placeholder.brackets': '',
    template: '',
    'template.pattern': '',
    'factory.meta': '',
    'factory.template': '',
    'creator.template': '',
    creator: '',
    'factory.template.resolver': '',
    'factory.placeholder': '',
    'factory.placeholder.resolver': '',
    'factory:obsidian:file': '',
    resolver: '',
};

for (const key of Object.keys(SI)) {
    //@ts-ignore
    SI[key] = Symbol.for(key);
}

export default SI;