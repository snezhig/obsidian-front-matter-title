const TYPES = {
    dispatcher: '',
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
    resolver: '',
};

for (const key of Object.keys(TYPES)) {
    //@ts-ignore
    TYPES[key] = Symbol.for(key);
}

export default TYPES;