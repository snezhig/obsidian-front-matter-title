const TYPES = {
    dispatcher: '',
    cache: '',
    filter: '',
    placeholder: '',
    'components.extractor': '',
    'components.black_white_list': '',
    'placeholder.meta': '',
    'placeholder.brackets': '',
    template: '',
    'template.pattern': '',
    'factory.meta': '',
    'creator.template.factory': '',
    'creator.template': '',
    creator: '',
    'creator.template.factory.resolver': '',
    'creator.template.placeholder.factory': '',
    'creator.template.placeholder.factory.resolver': '',
    resolver: '',
};

for (const key of Object.keys(TYPES)) {
    //@ts-ignore
    TYPES[key] = Symbol.for(key);
}

export default TYPES;