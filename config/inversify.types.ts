const TYPES = {
    dispatcher: '',
    'factory.meta': '',
    'creator.template.factory': '',
    'creator.template': '',
    'creator': '',
    'creator.template.factory.resolver': '',
    'creator.template.placeholder.factory': '',
    'creator.template.placeholder.factory.resolver': ''
};

for (const key of Object.keys(TYPES)) {
    //@ts-ignore
    TYPES[key] = Symbol.for(key);
}

export default TYPES;